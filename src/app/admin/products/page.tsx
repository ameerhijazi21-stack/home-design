"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  AlertTriangle,
  Edit3,
  Loader2,
  LogOut,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

type Product = {
  id: number;
  created_at: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  price: number;
  old_price: number | null;
  image: string | null;
  images: string[];
  sku: string | null;
  stock: number;
  featured: boolean;
  on_sale: boolean;
  is_new: boolean;
  active: boolean;
};

type InventoryVariant = {
  id: number;
  product_id: number;
  color: string | null;
  size: string | null;
  stock: number;
  active: boolean;
};

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory: string;
  price: string;
  old_price: string;
  image: string;
  images: string[];
  sku: string;
  stock: string;
  featured: boolean;
  on_sale: boolean;
  is_new: boolean;
  active: boolean;
};

type ProductVariantForm = {
  id?: number;
  tempId: string;
  color: string;
  size: string;
  price: string;
  stock: string;
  sku: string;
  active: boolean;
};


type CategoryOption = {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  active: boolean;
};

type SubcategoryOption = {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  sort_order: number;
  active: boolean;
};

function createEmptyVariant(): ProductVariantForm {
  return {
    tempId: crypto.randomUUID(),
    color: "",
    size: "",
    price: "",
    stock: "0",
    sku: "",
    active: true,
  };
}

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  description: "",
  category: "",
  subcategory: "",
  price: "",
  old_price: "",
  image: "",
  images: [],
  sku: "",
  stock: "0",
  featured: false,
  on_sale: false,
  is_new: false,
  active: true,
};

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [inventoryVariants, setInventoryVariants] =
    useState<InventoryVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [variants, setVariants] =
    useState<ProductVariantForm[]>([]);
  const [originalVariantIds, setOriginalVariantIds] =
    useState<number[]>([]);
  const [loadingVariants, setLoadingVariants] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [categoryOptions, setCategoryOptions] =
    useState<CategoryOption[]>([]);
  const [subcategoryOptions, setSubcategoryOptions] =
    useState<SubcategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  useEffect(() => {
    async function initialize() {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.replace("/admin/login");
        return;
      }

      setAuthorized(true);

      await Promise.all([
        loadCategoryOptions(),
        loadProducts(),
      ]);
    }

    initialize();
  }, [router]);

  async function loadCategoryOptions() {
    setCategoriesLoading(true);

    const [categoriesResult, subcategoriesResult] =
      await Promise.all([
        supabase
          .from("categories")
          .select("id, name, slug, sort_order, active")
          .order("sort_order", { ascending: true }),
        supabase
          .from("subcategories")
          .select(
            "id, category_id, name, slug, sort_order, active"
          )
          .order("sort_order", { ascending: true }),
      ]);

    if (categoriesResult.error) {
      console.error(
        "Error loading categories:",
        categoriesResult.error
      );
      setError(
        `לא ניתן לטעון את הקטגוריות: ${categoriesResult.error.message}`
      );
      setCategoriesLoading(false);
      return;
    }

    if (subcategoriesResult.error) {
      console.error(
        "Error loading subcategories:",
        subcategoriesResult.error
      );
      setError(
        `לא ניתן לטעון את תתי־הקטגוריות: ${subcategoriesResult.error.message}`
      );
      setCategoriesLoading(false);
      return;
    }

    setCategoryOptions(
      (categoriesResult.data || []) as CategoryOption[]
    );
    setSubcategoryOptions(
      (subcategoriesResult.data || []) as SubcategoryOption[]
    );
    setCategoriesLoading(false);
  }

  function getCategoryBySlug(categorySlug: string) {
    return categoryOptions.find(
      (category) => category.slug === categorySlug
    );
  }

  function getSubcategoriesForCategory(
    categorySlug: string
  ) {
    const category = getCategoryBySlug(categorySlug);

    if (!category) {
      return [];
    }

    return subcategoryOptions
      .filter(
        (subcategory) =>
          subcategory.category_id === category.id
      )
      .sort(
        (a, b) =>
          a.sort_order - b.sort_order
      );
  }

  function getCategoryLabel(categorySlug: string) {
    return (
      getCategoryBySlug(categorySlug)?.name ||
      categorySlug
    );
  }

  function getSubcategoryLabel(
    categorySlug: string,
    subcategorySlug: string | null
  ) {
    if (!subcategorySlug) {
      return "";
    }

    return (
      getSubcategoriesForCategory(
        categorySlug
      ).find(
        (subcategory) =>
          subcategory.slug === subcategorySlug
      )?.name || subcategorySlug
    );
  }

  async function loadProducts() {
    setLoading(true);
    setError("");

    const [productsResult, variantsResult] =
      await Promise.all([
        supabase
          .from("products")
          .select("*")
          .order("created_at", {
            ascending: false,
          }),
        supabase
          .from("product_variants")
          .select("id, product_id, color, size, stock, active"),
      ]);

    if (productsResult.error) {
      console.error(productsResult.error);

      setError(
        `לא ניתן לטעון את המוצרים: ${productsResult.error.message}`
      );

      setLoading(false);
      return;
    }

    if (variantsResult.error) {
      console.error(variantsResult.error);

      setError(
        `המוצרים נטענו, אך לא ניתן לטעון את מלאי הווריאציות: ${variantsResult.error.message}`
      );
    }

    setProducts(
      (productsResult.data || []) as Product[]
    );
    setInventoryVariants(
      (variantsResult.data || []) as InventoryVariant[]
    );
    setLoading(false);
  }

  function openNewProductForm() {
    const firstActiveCategory =
      categoryOptions.find(
        (category) => category.active
      )?.slug || "";

    setEditingProduct(null);
    setForm({
      ...emptyForm,
      category: firstActiveCategory,
    });
    setVariants([]);
    setOriginalVariantIds([]);
    setShowForm(true);
    setError("");
  }

  async function openEditProductForm(product: Product) {
    setEditingProduct(product);

    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      category: product.category,
      subcategory: product.subcategory || "",
      price: String(product.price),
      old_price:
        product.old_price !== null
          ? String(product.old_price)
          : "",
      image: product.image || "",
      images:
        product.images && product.images.length > 0
          ? product.images
          : product.image
            ? [product.image]
            : [],
      sku: product.sku || "",
      stock: String(product.stock),
      featured: product.featured,
      on_sale: product.on_sale,
      is_new: product.is_new,
      active: product.active,
    });

    setVariants([]);
    setOriginalVariantIds([]);
    setShowForm(true);
    setError("");
    setLoadingVariants(true);

    const { data, error: variantsError } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", product.id)
      .order("created_at", { ascending: true });

    if (variantsError) {
      console.error(variantsError);
      setError(
        `לא ניתן לטעון את הווריאציות: ${variantsError.message}`
      );
      setLoadingVariants(false);
      return;
    }

    const loadedVariants: ProductVariantForm[] =
      (data || []).map((variant) => ({
        id: variant.id,
        tempId: `existing-${variant.id}`,
        color: variant.color || "",
        size: variant.size || "",
        price:
          variant.price !== null
            ? String(variant.price)
            : "",
        stock: String(variant.stock ?? 0),
        sku: variant.sku || "",
        active: variant.active ?? true,
      }));

    setVariants(loadedVariants);
    setOriginalVariantIds(
      loadedVariants
        .map((variant) => variant.id)
        .filter((id): id is number => id !== undefined)
    );
    setLoadingVariants(false);
  }

  function closeForm() {
    if (saving || uploadingImage) {
      return;
    }

    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setVariants([]);
    setOriginalVariantIds([]);
  }

  function updateForm<K extends keyof ProductForm>(
    key: K,
    value: ProductForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug:
        editingProduct === null
          ? createSlug(value)
          : current.slug,
    }));
  }

  async function uploadProductImages(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    setError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const maxSize = 5 * 1024 * 1024;

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError("אפשר להעלות רק תמונות JPG, PNG או WebP.");
        event.target.value = "";
        return;
      }

      if (file.size > maxSize) {
        setError("כל תמונה חייבת להיות עד 5MB.");
        event.target.value = "";
        return;
      }
    }

    try {
      setUploadingImage(true);

      const uploadedUrls: string[] = [];

      for (const file of files) {
        const extension =
          file.name.split(".").pop()?.toLowerCase() || "jpg";

        const fileName =
          `${Date.now()}-${crypto.randomUUID()}.${extension}`;

        const filePath = `products/${fileName}`;

        const { error: uploadError } =
          await supabase.storage
            .from("product-images")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
      }

      setForm((current) => {
        const nextImages = [
          ...current.images,
          ...uploadedUrls,
        ];

        return {
          ...current,
          images: nextImages,
          image:
            current.image ||
            nextImages[0] ||
            "",
        };
      });
    } catch (uploadError) {
      console.error(uploadError);

      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "שגיאה לא ידועה";

      setError(
        `לא ניתן להעלות את התמונות: ${message}`
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  function setPrimaryImage(imageUrl: string) {
    setForm((current) => ({
      ...current,
      image: imageUrl,
    }));
  }

  function removeImage(imageUrl: string) {
    setForm((current) => {
      const nextImages = current.images.filter(
        (url) => url !== imageUrl
      );

      return {
        ...current,
        images: nextImages,
        image:
          current.image === imageUrl
            ? nextImages[0] || ""
            : current.image,
      };
    });
  }

  function addVariant() {
    setVariants((current) => [
      ...current,
      createEmptyVariant(),
    ]);
  }

  function updateVariant<K extends keyof ProductVariantForm>(
    tempId: string,
    key: K,
    value: ProductVariantForm[K]
  ) {
    setVariants((current) =>
      current.map((variant) =>
        variant.tempId === tempId
          ? {
              ...variant,
              [key]: value,
            }
          : variant
      )
    );
  }

  function removeVariant(tempId: string) {
    setVariants((current) =>
      current.filter(
        (variant) => variant.tempId !== tempId
      )
    );
  }

  async function saveVariants(productId: number) {
    for (const variant of variants) {
      const stock = Number(variant.stock);

      if (
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        throw new Error(
          "המלאי בכל וריאציה חייב להיות מספר שלם שאינו שלילי."
        );
      }

      let variantPrice: number | null = null;

      if (variant.price.trim() !== "") {
        const priceValue = Number(variant.price);

        if (
          !Number.isFinite(priceValue) ||
          priceValue < 0
        ) {
          throw new Error(
            "המחיר באחת הווריאציות אינו תקין."
          );
        }

        variantPrice = priceValue;
      }

      if (
        !variant.color.trim() &&
        !variant.size.trim()
      ) {
        throw new Error(
          "בכל וריאציה יש להזין לפחות צבע או מידה."
        );
      }

      const payload = {
        product_id: productId,
        color: variant.color.trim() || null,
        size: variant.size.trim() || null,
        price: variantPrice,
        stock,
        sku: variant.sku.trim() || null,
        active: variant.active,
      };

      if (variant.id) {
        const { error } = await supabase
          .from("product_variants")
          .update(payload)
          .eq("id", variant.id)
          .eq("product_id", productId);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase
          .from("product_variants")
          .insert(payload);

        if (error) {
          throw error;
        }
      }
    }

    const currentIds = variants
      .map((variant) => variant.id)
      .filter((id): id is number => id !== undefined);

    const removedIds = originalVariantIds.filter(
      (id) => !currentIds.includes(id)
    );

    if (removedIds.length > 0) {
      const { error } = await supabase
        .from("product_variants")
        .delete()
        .in("id", removedIds)
        .eq("product_id", productId);

      if (error) {
        throw error;
      }
    }
  }

  async function saveProduct(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("יש להזין שם מוצר.");
      return;
    }

    if (!form.slug.trim()) {
      setError("יש להזין Slug למוצר.");
      return;
    }

    if (!form.category) {
      setError("יש לבחור קטגוריה.");
      return;
    }

    const availableSubcategories =
      getSubcategoriesForCategory(
        form.category
      );

    if (
      availableSubcategories.length > 0 &&
      !form.subcategory
    ) {
      setError("יש לבחור תת־קטגוריה.");
      return;
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price < 0) {
      setError("מחיר המוצר אינו תקין.");
      return;
    }

    const stock = Number(form.stock);

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError("המלאי חייב להיות מספר שלם שאינו שלילי.");
      return;
    }

    let oldPrice: number | null = null;

    if (form.old_price.trim() !== "") {
      const value = Number(form.old_price);

      if (!Number.isFinite(value) || value < 0) {
        setError("המחיר הקודם אינו תקין.");
        return;
      }

      oldPrice = value;
    }

    const payload = {
      name: form.name.trim(),
      slug: createSlug(form.slug),
      description:
        form.description.trim() || null,
      category: form.category,
      subcategory: form.subcategory.trim() || null,
      price,
      old_price: oldPrice,
      image:
        form.image.trim() ||
        form.images[0] ||
        null,
      images: form.images,
      sku: form.sku.trim() || null,
      stock,
      featured: form.featured,
      on_sale: form.on_sale,
      is_new: form.is_new,
      active: form.active,
    };

    setSaving(true);

    try {
      let productId: number;

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);

        if (error) {
          throw error;
        }

        productId = editingProduct.id;
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();

        if (error) {
          throw error;
        }

        productId = data.id;
      }

      await saveVariants(productId);

      setSaving(false);
      setShowForm(false);
      setEditingProduct(null);
      setForm(emptyForm);
      setVariants([]);
      setOriginalVariantIds([]);

      await loadProducts();
    } catch (saveError) {
      console.error(saveError);

      const message =
        saveError instanceof Error
          ? saveError.message
          : "שגיאה לא ידועה";

      if (
        message
          .toLowerCase()
          .includes("unique")
      ) {
        setError(
          "יש כבר מוצר או וריאציה עם אותו Slug או מק״ט."
        );
      } else {
        setError(
          `לא ניתן לשמור את המוצר: ${message}`
        );
      }

      setSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `האם אתה בטוח שברצונך למחוק את המוצר "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(product.id);
    setError("");

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      console.error(error);

      setError(
        `לא ניתן למחוק את המוצר: ${error.message}`
      );

      setDeletingId(null);
      return;
    }

    setProducts((current) =>
      current.filter(
        (item) => item.id !== product.id
      )
    );

    setDeletingId(null);
  }

  async function toggleActive(product: Product) {
    const newValue = !product.active;

    const { error } = await supabase
      .from("products")
      .update({
        active: newValue,
      })
      .eq("id", product.id);

    if (error) {
      setError(
        `לא ניתן לשנות את מצב המוצר: ${error.message}`
      );

      return;
    }

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id
          ? {
              ...item,
              active: newValue,
            }
          : item
      )
    );
  }

  async function logout() {
    await supabase.auth.signOut();

    router.replace("/admin/login");
    router.refresh();
  }

  function getProductVariants(productId: number) {
    return inventoryVariants.filter(
      (variant) =>
        variant.product_id === productId &&
        variant.active
    );
  }

  function getInventoryStatus(product: Product) {
    const activeVariants =
      getProductVariants(product.id);

    if (activeVariants.length > 0) {
      const totalStock = activeVariants.reduce(
        (total, variant) =>
          total + Number(variant.stock ?? 0),
        0
      );

      const lowVariants = activeVariants.filter(
        (variant) =>
          Number(variant.stock ?? 0) > 0 &&
          Number(variant.stock ?? 0) <= 5
      ).length;

      const outVariants = activeVariants.filter(
        (variant) =>
          Number(variant.stock ?? 0) === 0
      ).length;

      return {
        stock: totalStock,
        hasVariants: true,
        lowVariants,
        outVariants,
        status:
          totalStock === 0
            ? "out"
            : lowVariants > 0 || outVariants > 0
              ? "low"
              : "ok",
      };
    }

    const stock = Number(product.stock ?? 0);

    return {
      stock,
      hasVariants: false,
      lowVariants: 0,
      outVariants: 0,
      status:
        stock === 0
          ? "out"
          : stock <= 5
            ? "low"
            : "ok",
    };
  }

  const inventorySummary = useMemo(() => {
    let low = 0;
    let out = 0;

    products.forEach((product) => {
      const activeVariants =
        inventoryVariants.filter(
          (variant) =>
            variant.product_id === product.id &&
            variant.active
        );

      if (activeVariants.length > 0) {
        const totalStock = activeVariants.reduce(
          (total, variant) =>
            total + Number(variant.stock ?? 0),
          0
        );

        if (totalStock === 0) {
          out += 1;
        } else if (
          activeVariants.some(
            (variant) =>
              Number(variant.stock ?? 0) <= 5
          )
        ) {
          low += 1;
        }
      } else {
        const stock = Number(product.stock ?? 0);

        if (stock === 0) {
          out += 1;
        } else if (stock <= 5) {
          low += 1;
        }
      }
    });

    return {
      total: products.length,
      low,
      out,
    };
  }, [products, inventoryVariants]);

  const filteredProducts = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        search === "" ||
        product.name
          .toLowerCase()
          .includes(search) ||
        product.slug
          .toLowerCase()
          .includes(search) ||
        (product.sku || "")
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        categoryFilter === "all" ||
        product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [
    products,
    searchTerm,
    categoryFilter,
  ]);

  if (!authorized) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-neutral-100"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-16">
          <Loader2
            size={22}
            className="animate-spin"
          />

          <p>בודק הרשאות...</p>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-100 text-black"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="mb-8 flex flex-col gap-5 border-b border-gray-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium tracking-wide text-gray-500">
              HOME DESIGN ADMIN
            </p>

            <h1 className="text-3xl font-semibold sm:text-4xl">
              ניהול מוצרים
            </h1>

            <p className="mt-3 text-gray-500">
              הוספה, עריכה וניהול של מוצרי החנות.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openNewProductForm}
              disabled={categoriesLoading}
              className="flex items-center gap-2 bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <Plus size={18} />

              {categoriesLoading
                ? "טוען קטגוריות..."
                : "הוספת מוצר"}
            </button>

            <button
              type="button"
              onClick={loadProducts}
              disabled={loading}
              className="flex items-center gap-2 border border-gray-300 bg-white px-5 py-3 text-sm font-medium transition hover:bg-neutral-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  loading ? "animate-spin" : ""
                }
              />

              רענון
            </button>

            <Link
              href="/admin"
              className="flex items-center gap-2 border border-gray-300 bg-white px-5 py-3 text-sm font-medium transition hover:bg-neutral-50"
            >
              <ArrowRight size={17} />

              לוח בקרה
            </Link>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 border border-gray-300 bg-white px-5 py-3 text-sm font-medium transition hover:bg-neutral-50"
            >
              <LogOut size={17} />

              התנתקות
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              סך מוצרים
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {inventorySummary.total}
            </p>
          </div>

          <div className="rounded-xl border border-orange-100 bg-orange-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">
                  מלאי נמוך
                </p>
                <p className="mt-2 text-3xl font-semibold text-orange-800">
                  {inventorySummary.low}
                </p>
              </div>
              <AlertTriangle
                size={24}
                className="text-orange-700"
              />
            </div>
          </div>

          <div className="rounded-xl border border-red-100 bg-red-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">
                  אזל מהמלאי
                </p>
                <p className="mt-2 text-3xl font-semibold text-red-800">
                  {inventorySummary.out}
                </p>
              </div>
              <Package
                size={24}
                className="text-red-700"
              />
            </div>
          </div>
        </div>

        <div className="mb-7 grid grid-cols-1 gap-4 rounded-xl bg-white p-5 shadow-sm md:grid-cols-[1fr_240px]">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">
              חיפוש מוצר
            </label>

            <div className="relative">
              <Search
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="שם מוצר, Slug או מק״ט..."
                className="w-full border border-gray-300 py-3 pl-4 pr-11 outline-none transition focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">
              קטגוריה
            </label>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
              className="w-full border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
            >
              <option value="all">
                כל הקטגוריות
              </option>

              {categoryOptions.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.slug}
                  >
                    {category.name}
                    {!category.active
                      ? " (לא פעיל)"
                      : ""}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {!loading && (
          <p className="mb-5 text-sm text-gray-500">
            נמצאו{" "}
            <span className="font-semibold text-black">
              {filteredProducts.length}
            </span>{" "}
            מוצרים
          </p>
        )}

        {loading ? (
          <div className="rounded-xl bg-white p-14 text-center shadow-sm">
            <Loader2
              size={36}
              className="mx-auto mb-4 animate-spin"
            />

            <p className="text-gray-500">
              טוען מוצרים...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl bg-white p-14 text-center shadow-sm">
            <Package
              size={48}
              strokeWidth={1.4}
              className="mx-auto mb-5 text-gray-400"
            />

            <h2 className="text-2xl font-semibold">
              עדיין אין מוצרים
            </h2>

            <p className="mt-3 text-gray-500">
              לחץ על "הוספת מוצר" כדי לבדוק שמערכת
              הניהול עובדת.
            </p>

            <button
              type="button"
              onClick={openNewProductForm}
              disabled={categoriesLoading}
              className="mt-6 inline-flex items-center gap-2 bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <Plus size={18} />

              הוספת מוצר
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-right">
                <thead className="border-b border-gray-200 bg-neutral-50">
                  <tr>
                    <th className="px-5 py-4 text-sm font-semibold">
                      מוצר
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold">
                      קטגוריה
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold">
                      מחיר
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold">
                      מלאי
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold">
                      מצב
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold">
                      פעולות
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map(
                    (product) => (
                      <tr
                        key={product.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 shrink-0 overflow-hidden bg-neutral-100">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package
                                    size={22}
                                    className="text-gray-400"
                                  />
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="font-medium">
                                {product.name}
                              </p>

                              <p
                                dir="ltr"
                                className="mt-1 text-left text-xs text-gray-400"
                              >
                                {product.slug}
                              </p>

                              {product.sku && (
                                <p className="mt-1 text-xs text-gray-400">
                                  מק״ט: {product.sku}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm">
                          <p>
                            {getCategoryLabel(
                              product.category
                            )}
                          </p>

                          {product.subcategory && (
                            <p className="mt-1 text-xs text-gray-400">
                              {getSubcategoryLabel(
                                product.category,
                                product.subcategory
                              )}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold">
                            ₪
                            {Number(
                              product.price
                            ).toLocaleString(
                              "he-IL"
                            )}
                          </p>

                          {product.old_price !==
                            null && (
                            <p className="text-sm text-gray-400 line-through">
                              ₪
                              {Number(
                                product.old_price
                              ).toLocaleString(
                                "he-IL"
                              )}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {(() => {
                            const inventory =
                              getInventoryStatus(product);

                            return (
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`font-semibold ${
                                      inventory.status === "out"
                                        ? "text-red-600"
                                        : inventory.status === "low"
                                          ? "text-orange-700"
                                          : "text-green-700"
                                    }`}
                                  >
                                    {inventory.stock}
                                  </span>

                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                      inventory.status === "out"
                                        ? "bg-red-100 text-red-700"
                                        : inventory.status === "low"
                                          ? "bg-orange-100 text-orange-700"
                                          : "bg-green-100 text-green-700"
                                    }`}
                                  >
                                    {inventory.status === "out"
                                      ? "אזל מהמלאי"
                                      : inventory.status === "low"
                                        ? "מלאי נמוך"
                                        : "במלאי"}
                                  </span>
                                </div>

                                {inventory.hasVariants && (
                                  <div className="mt-2 space-y-1 text-xs text-gray-500">
                                    <p>
                                      מלאי כולל בווריאציות
                                    </p>

                                    {inventory.lowVariants > 0 && (
                                      <p className="text-orange-700">
                                        {inventory.lowVariants} וריאציות במלאי נמוך
                                      </p>
                                    )}

                                    {inventory.outVariants > 0 && (
                                      <p className="text-red-600">
                                        {inventory.outVariants} וריאציות אזלו
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              toggleActive(
                                product
                              )
                            }
                            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                              product.active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {product.active
                              ? "פעיל"
                              : "לא פעיל"}
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditProductForm(
                                  product
                                )
                              }
                              className="flex items-center gap-2 border border-gray-300 px-3 py-2 text-sm transition hover:bg-neutral-50"
                            >
                              <Edit3
                                size={15}
                              />

                              עריכה
                            </button>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                product.id
                              }
                              onClick={() =>
                                deleteProduct(
                                  product
                                )
                              }
                              className="flex items-center gap-2 border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId ===
                              product.id ? (
                                <Loader2
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2
                                  size={15}
                                />
                              )}

                              מחיקה
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* PRODUCT FORM MODAL */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8">
          <div className="my-auto w-full max-w-3xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-5 sm:p-6">
              <div>
                <h2 className="text-2xl font-semibold">
                  {editingProduct
                    ? "עריכת מוצר"
                    : "הוספת מוצר"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  פרטי המוצר יישמרו ב־Supabase.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 transition hover:bg-neutral-100"
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={saveProduct}
              className="p-5 sm:p-6"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    שם המוצר *
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      handleNameChange(
                        event.target.value
                      )
                    }
                    className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Slug *
                  </label>

                  <input
                    dir="ltr"
                    type="text"
                    value={form.slug}
                    onChange={(event) =>
                      updateForm(
                        "slug",
                        event.target.value
                      )
                    }
                    className="w-full border border-gray-300 px-4 py-3 text-left outline-none focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    קטגוריה *
                  </label>

                  <select
                    value={form.category}
                    onChange={(event) => {
                      const nextCategory = event.target.value;

                      setForm((current) => ({
                        ...current,
                        category: nextCategory,
                        subcategory: "",
                      }));
                    }}
                    className="w-full border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                  >
                    <option value="">
                      בחירת קטגוריה
                    </option>

                    {categoryOptions.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.slug}
                          disabled={
                            !category.active &&
                            form.category !==
                              category.slug
                          }
                        >
                          {category.name}
                          {!category.active
                            ? " (לא פעילה)"
                            : ""}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    תת־קטגוריה
                    {getSubcategoriesForCategory(
                      form.category
                    ).length > 0
                      ? " *"
                      : ""}
                  </label>

                  {getSubcategoriesForCategory(
                    form.category
                  ).length > 0 ? (
                    <select
                      value={form.subcategory}
                      onChange={(event) =>
                        updateForm(
                          "subcategory",
                          event.target.value
                        )
                      }
                      className="w-full border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                      required
                    >
                      <option value="">
                        בחירת תת־קטגוריה
                      </option>

                      {getSubcategoriesForCategory(
                        form.category
                      ).map(
                        (subcategory) => (
                          <option
                            key={subcategory.id}
                            value={subcategory.slug}
                            disabled={
                              !subcategory.active &&
                              form.subcategory !==
                                subcategory.slug
                            }
                          >
                            {subcategory.name}
                            {!subcategory.active
                              ? " (לא פעילה)"
                              : ""}
                          </option>
                        )
                      )}
                    </select>
                  ) : (
                    <div className="border border-gray-200 bg-neutral-50 px-4 py-3 text-sm text-gray-500">
                      אין תתי־קטגוריות לקטגוריה זו
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    מחיר *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      updateForm(
                        "price",
                        event.target.value
                      )
                    }
                    className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    מחיר קודם
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.old_price}
                    onChange={(event) =>
                      updateForm(
                        "old_price",
                        event.target.value
                      )
                    }
                    placeholder="אופציונלי"
                    className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    מלאי *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(event) =>
                      updateForm(
                        "stock",
                        event.target.value
                      )
                    }
                    className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    מק״ט
                  </label>

                  <input
                    dir="ltr"
                    type="text"
                    value={form.sku}
                    onChange={(event) =>
                      updateForm(
                        "sku",
                        event.target.value
                      )
                    }
                    className="w-full border border-gray-300 px-4 py-3 text-left outline-none focus:border-black"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    תמונות מוצר
                  </label>

                  <div className="rounded-lg border border-gray-200 bg-neutral-50 p-4">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          גלריית תמונות
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          ניתן לבחור כמה תמונות יחד. JPG, PNG או WebP עד 5MB לכל תמונה.
                        </p>
                      </div>

                      <label
                        className={`inline-flex w-fit cursor-pointer items-center gap-2 bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 ${
                          uploadingImage
                            ? "pointer-events-none opacity-50"
                            : ""
                        }`}
                      >
                        {uploadingImage ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Upload size={17} />
                        )}

                        {uploadingImage
                          ? "מעלה תמונות..."
                          : "בחירת תמונות"}

                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp"
                          onChange={uploadProductImages}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {form.images.length === 0 ? (
                      <div className="flex min-h-36 items-center justify-center border border-dashed border-gray-300 bg-white">
                        <div className="text-center text-gray-400">
                          <Package
                            size={34}
                            className="mx-auto mb-2"
                          />

                          <p className="text-sm">
                            עדיין לא הועלו תמונות
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {form.images.map((imageUrl) => (
                          <div
                            key={imageUrl}
                            className={`overflow-hidden border bg-white ${
                              form.image === imageUrl
                                ? "border-black"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="aspect-square overflow-hidden bg-neutral-100">
                              <img
                                src={imageUrl}
                                alt="תמונת מוצר"
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="space-y-2 p-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setPrimaryImage(imageUrl)
                                }
                                className={`w-full px-2 py-2 text-xs font-medium transition ${
                                  form.image === imageUrl
                                    ? "bg-black text-white"
                                    : "bg-neutral-100 hover:bg-neutral-200"
                                }`}
                              >
                                {form.image === imageUrl
                                  ? "תמונה ראשית"
                                  : "הגדר כראשית"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  removeImage(imageUrl)
                                }
                                className="w-full px-2 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                              >
                                הסרה
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {form.image && (
                    <div className="mt-4">
                      <label className="mb-2 block text-xs font-medium text-gray-500">
                        כתובת התמונה הראשית
                      </label>

                      <input
                        dir="ltr"
                        type="text"
                        value={form.image}
                        readOnly
                        className="w-full border border-gray-300 bg-neutral-50 px-4 py-3 text-left text-sm text-gray-500 outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <div className="rounded-lg border border-gray-200 bg-neutral-50 p-4 sm:p-5">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-semibold">
                          וריאציות מוצר
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          לדוגמה: צבע בז׳ + מידה 220 ס״מ, או מזרן במידה 160×200.
                          מחיר ריק ישתמש במחיר הראשי של המוצר.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={addVariant}
                        disabled={loadingVariants}
                        className="inline-flex w-fit items-center gap-2 border border-black px-4 py-2.5 text-sm font-medium transition hover:bg-black hover:text-white disabled:opacity-50"
                      >
                        <Plus size={16} />
                        הוספת וריאציה
                      </button>
                    </div>

                    {loadingVariants ? (
                      <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        טוען וריאציות...
                      </div>
                    ) : variants.length === 0 ? (
                      <div className="border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
                        אין וריאציות למוצר. אם אין צורך בצבעים או מידות שונות,
                        אפשר להשאיר את האזור ריק.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {variants.map((variant, index) => (
                          <div
                            key={variant.tempId}
                            className="border border-gray-200 bg-white p-4"
                          >
                            <div className="mb-4 flex items-center justify-between gap-3">
                              <p className="font-medium">
                                וריאציה {index + 1}
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  removeVariant(
                                    variant.tempId
                                  )
                                }
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 transition hover:text-red-800"
                              >
                                <Trash2 size={15} />
                                הסרה
                              </button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              <div>
                                <label className="mb-2 block text-xs font-medium text-gray-600">
                                  צבע
                                </label>

                                <input
                                  type="text"
                                  value={variant.color}
                                  onChange={(event) =>
                                    updateVariant(
                                      variant.tempId,
                                      "color",
                                      event.target.value
                                    )
                                  }
                                  placeholder="לדוגמה: בז׳"
                                  className="w-full border border-gray-300 px-3 py-2.5 outline-none focus:border-black"
                                />
                              </div>

                              <div>
                                <label className="mb-2 block text-xs font-medium text-gray-600">
                                  מידה
                                </label>

                                <input
                                  type="text"
                                  value={variant.size}
                                  onChange={(event) =>
                                    updateVariant(
                                      variant.tempId,
                                      "size",
                                      event.target.value
                                    )
                                  }
                                  placeholder="לדוגמה: 160×200"
                                  className="w-full border border-gray-300 px-3 py-2.5 outline-none focus:border-black"
                                />
                              </div>

                              <div>
                                <label className="mb-2 block text-xs font-medium text-gray-600">
                                  מחיר
                                </label>

                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={variant.price}
                                  onChange={(event) =>
                                    updateVariant(
                                      variant.tempId,
                                      "price",
                                      event.target.value
                                    )
                                  }
                                  placeholder={`ברירת מחדל: ₪${Number(
                                    form.price || 0
                                  ).toLocaleString("he-IL")}`}
                                  className="w-full border border-gray-300 px-3 py-2.5 outline-none focus:border-black"
                                />
                              </div>

                              <div>
                                <label className="mb-2 block text-xs font-medium text-gray-600">
                                  מלאי
                                </label>

                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={variant.stock}
                                  onChange={(event) =>
                                    updateVariant(
                                      variant.tempId,
                                      "stock",
                                      event.target.value
                                    )
                                  }
                                  className="w-full border border-gray-300 px-3 py-2.5 outline-none focus:border-black"
                                />
                              </div>

                              <div>
                                <label className="mb-2 block text-xs font-medium text-gray-600">
                                  מק״ט וריאציה
                                </label>

                                <input
                                  dir="ltr"
                                  type="text"
                                  value={variant.sku}
                                  onChange={(event) =>
                                    updateVariant(
                                      variant.tempId,
                                      "sku",
                                      event.target.value
                                    )
                                  }
                                  placeholder="אופציונלי"
                                  className="w-full border border-gray-300 px-3 py-2.5 text-left outline-none focus:border-black"
                                />
                              </div>

                              <label className="flex items-center gap-2 self-end pb-3 text-sm">
                                <input
                                  type="checkbox"
                                  checked={variant.active}
                                  onChange={(event) =>
                                    updateVariant(
                                      variant.tempId,
                                      "active",
                                      event.target.checked
                                    )
                                  }
                                />
                                וריאציה פעילה
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    תיאור
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateForm(
                        "description",
                        event.target.value
                      )
                    }
                    rows={4}
                    className="w-full resize-none border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 pt-6 sm:grid-cols-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(event) =>
                      updateForm(
                        "active",
                        event.target.checked
                      )
                    }
                  />

                  פעיל
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) =>
                      updateForm(
                        "featured",
                        event.target.checked
                      )
                    }
                  />

                  מומלץ
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.on_sale}
                    onChange={(event) =>
                      updateForm(
                        "on_sale",
                        event.target.checked
                      )
                    }
                  />

                  במבצע
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.is_new}
                    onChange={(event) =>
                      updateForm(
                        "is_new",
                        event.target.checked
                      )
                    }
                  />

                  חדש
                </label>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving || uploadingImage}
                  className="border border-gray-300 px-6 py-3 text-sm font-medium transition hover:bg-neutral-50 disabled:opacity-50"
                >
                  ביטול
                </button>

                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="flex items-center justify-center gap-2 bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {editingProduct
                    ? "שמירת שינויים"
                    : "הוספת מוצר"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}