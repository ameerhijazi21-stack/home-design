"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

type Category = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  active: boolean;
  show_in_nav: boolean;
  show_on_homepage: boolean;
  created_at: string;
  updated_at: string;
};

type Subcategory = {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  active: boolean;
  show_in_nav: boolean;
  show_on_homepage: boolean;
  created_at: string;
  updated_at: string;
};

type CategoryForm = {
  name: string;
  slug: string;
  image_url: string;
  sort_order: string;
  active: boolean;
  show_in_nav: boolean;
  show_on_homepage: boolean;
};

type SubcategoryForm = {
  name: string;
  slug: string;
  image_url: string;
  sort_order: string;
  active: boolean;
  show_in_nav: boolean;
  show_on_homepage: boolean;
};

const emptyCategoryForm: CategoryForm = {
  name: "",
  slug: "",
  image_url: "",
  sort_order: "0",
  active: true,
  show_in_nav: true,
  show_on_homepage: false,
};

const emptySubcategoryForm: SubcategoryForm = {
  name: "",
  slug: "",
  image_url: "",
  sort_order: "0",
  active: true,
  show_in_nav: true,
  show_on_homepage: false,
};

function cleanSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return "אירעה שגיאה לא צפויה.";
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingSubcategory, setSavingSubcategory] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] =
    useState<number | null>(null);
  const [categoryForm, setCategoryForm] =
    useState<CategoryForm>(emptyCategoryForm);

  const [expandedCategoryIds, setExpandedCategoryIds] =
    useState<number[]>([]);

  const [subcategoryCategoryId, setSubcategoryCategoryId] =
    useState<number | null>(null);
  const [editingSubcategoryId, setEditingSubcategoryId] =
    useState<number | null>(null);
  const [subcategoryForm, setSubcategoryForm] =
    useState<SubcategoryForm>(emptySubcategoryForm);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        { data: categoryData, error: categoryError },
        { data: subcategoryData, error: subcategoryError },
      ] = await Promise.all([
        supabase
          .from("categories")
          .select("*")
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true }),

        supabase
          .from("subcategories")
          .select("*")
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true }),
      ]);

      if (categoryError) throw categoryError;
      if (subcategoryError) throw subcategoryError;

      setCategories((categoryData || []) as Category[]);
      setSubcategories((subcategoryData || []) as Subcategory[]);
    } catch (loadError) {
      console.error("Error loading categories:", loadError);
      setError(
        "לא הצלחנו לטעון את הקטגוריות. ודא שאתה מחובר כמנהל."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function resetMessages() {
    setError("");
    setSuccess("");
  }

  function openNewCategory() {
    resetMessages();
    setEditingCategoryId(null);

    const nextSort =
      categories.length > 0
        ? Math.max(...categories.map((item) => item.sort_order)) + 1
        : 1;

    setCategoryForm({
      ...emptyCategoryForm,
      sort_order: String(nextSort),
    });

    setShowCategoryForm(true);
  }

  function openEditCategory(category: Category) {
    resetMessages();
    setEditingCategoryId(category.id);

    setCategoryForm({
      name: category.name,
      slug: category.slug,
      image_url: category.image_url || "",
      sort_order: String(category.sort_order),
      active: category.active,
      show_in_nav: category.show_in_nav,
      show_on_homepage: category.show_on_homepage,
    });

    setShowCategoryForm(true);
  }

  function closeCategoryForm() {
    setShowCategoryForm(false);
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
  }

  async function saveCategory(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    resetMessages();

    const name = categoryForm.name.trim();
    const slug = cleanSlug(categoryForm.slug);
    const imageUrl =
      categoryForm.image_url.trim() || null;
    const sortOrder = Number(categoryForm.sort_order);

    if (!name) {
      setError("יש להזין שם לקטגוריה.");
      return;
    }

    if (!slug) {
      setError(
        "יש להזין slug באנגלית, למשל: living-room"
      );
      return;
    }

    if (
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      setError("סדר ההופעה חייב להיות מספר שלם חיובי או 0.");
      return;
    }

    setSavingCategory(true);

    try {
      const payload = {
        name,
        slug,
        image_url: imageUrl,
        sort_order: sortOrder,
        active: categoryForm.active,
        show_in_nav: categoryForm.show_in_nav,
        show_on_homepage:
          categoryForm.show_on_homepage,
      };

      if (editingCategoryId !== null) {
        const { error: updateError } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingCategoryId);

        if (updateError) throw updateError;

        setSuccess("הקטגוריה עודכנה בהצלחה.");
      } else {
        const { error: insertError } = await supabase
          .from("categories")
          .insert(payload);

        if (insertError) throw insertError;

        setSuccess("הקטגוריה נוספה בהצלחה.");
      }

      closeCategoryForm();
      await loadData();
    } catch (saveError) {
      console.error("Error saving category:", saveError);

      const message = getErrorMessage(saveError);

      if (message.includes("duplicate key")) {
        setError("כבר קיימת קטגוריה עם ה־slug הזה.");
      } else if (
        message.includes("לא ניתן לשנות slug")
      ) {
        setError(
          "לא ניתן לשנות את ה־slug של קטגוריה שכבר משויכים אליה מוצרים. אפשר לשנות את השם בלבד."
        );
      } else {
        setError(message);
      }
    } finally {
      setSavingCategory(false);
    }
  }

  async function deleteCategory(category: Category) {
    resetMessages();

    const approved = window.confirm(
      `למחוק את הקטגוריה "${category.name}"?\n\nאם קיימים בה מוצרים, Supabase יחסום את המחיקה.`
    );

    if (!approved) return;

    setDeletingId(`category-${category.id}`);

    try {
      const { error: deleteError } = await supabase
        .from("categories")
        .delete()
        .eq("id", category.id);

      if (deleteError) throw deleteError;

      setSuccess("הקטגוריה נמחקה.");
      await loadData();
    } catch (deleteError) {
      console.error("Error deleting category:", deleteError);

      const message = getErrorMessage(deleteError);

      if (
        message.includes("לא ניתן למחוק קטגוריה")
      ) {
        setError(
          "אי אפשר למחוק את הקטגוריה כי קיימים בה מוצרים. אפשר לערוך אותה ולהעביר אותה למצב לא פעיל."
        );
      } else if (
        message.includes("לא ניתן למחוק תת-קטגוריה")
      ) {
        setError(
          "אי אפשר למחוק את הקטגוריה כי אחת מתתי־הקטגוריות שלה נמצאת בשימוש."
        );
      } else {
        setError(message);
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleCategoryActive(
    category: Category
  ) {
    resetMessages();

    try {
      const { error: updateError } = await supabase
        .from("categories")
        .update({
          active: !category.active,
        })
        .eq("id", category.id);

      if (updateError) throw updateError;

      setSuccess(
        category.active
          ? "הקטגוריה הוסתרה."
          : "הקטגוריה הופעלה."
      );

      await loadData();
    } catch (toggleError) {
      console.error("Error toggling category:", toggleError);
      setError(getErrorMessage(toggleError));
    }
  }

  function toggleExpanded(categoryId: number) {
    setExpandedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  }

  function openNewSubcategory(categoryId: number) {
    resetMessages();
    setSubcategoryCategoryId(categoryId);
    setEditingSubcategoryId(null);

    const currentSubs = subcategories.filter(
      (item) => item.category_id === categoryId
    );

    const nextSort =
      currentSubs.length > 0
        ? Math.max(
            ...currentSubs.map((item) => item.sort_order)
          ) + 1
        : 1;

    setSubcategoryForm({
      ...emptySubcategoryForm,
      sort_order: String(nextSort),
    });

    setExpandedCategoryIds((current) =>
      current.includes(categoryId)
        ? current
        : [...current, categoryId]
    );
  }

  function openEditSubcategory(
    subcategory: Subcategory
  ) {
    resetMessages();
    setSubcategoryCategoryId(subcategory.category_id);
    setEditingSubcategoryId(subcategory.id);

    setSubcategoryForm({
      name: subcategory.name,
      slug: subcategory.slug,
      image_url: subcategory.image_url || "",
      sort_order: String(subcategory.sort_order),
      active: subcategory.active,
      show_in_nav: subcategory.show_in_nav,
      show_on_homepage:
        subcategory.show_on_homepage,
    });

    setExpandedCategoryIds((current) =>
      current.includes(subcategory.category_id)
        ? current
        : [...current, subcategory.category_id]
    );
  }

  function closeSubcategoryForm() {
    setSubcategoryCategoryId(null);
    setEditingSubcategoryId(null);
    setSubcategoryForm(emptySubcategoryForm);
  }

  async function saveSubcategory(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    resetMessages();

    if (subcategoryCategoryId === null) {
      setError("קטגוריית האב חסרה.");
      return;
    }

    const name = subcategoryForm.name.trim();
    const slug = cleanSlug(subcategoryForm.slug);
    const imageUrl =
      subcategoryForm.image_url.trim() || null;
    const sortOrder = Number(subcategoryForm.sort_order);

    if (!name) {
      setError("יש להזין שם לתת־הקטגוריה.");
      return;
    }

    if (!slug) {
      setError(
        "יש להזין slug באנגלית, למשל: coffee-tables"
      );
      return;
    }

    if (
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      setError("סדר ההופעה חייב להיות מספר שלם חיובי או 0.");
      return;
    }

    setSavingSubcategory(true);

    try {
      const payload = {
        category_id: subcategoryCategoryId,
        name,
        slug,
        image_url: imageUrl,
        sort_order: sortOrder,
        active: subcategoryForm.active,
        show_in_nav: subcategoryForm.show_in_nav,
        show_on_homepage:
          subcategoryForm.show_on_homepage,
      };

      if (editingSubcategoryId !== null) {
        const { error: updateError } = await supabase
          .from("subcategories")
          .update(payload)
          .eq("id", editingSubcategoryId);

        if (updateError) throw updateError;

        setSuccess("תת־הקטגוריה עודכנה בהצלחה.");
      } else {
        const { error: insertError } = await supabase
          .from("subcategories")
          .insert(payload);

        if (insertError) throw insertError;

        setSuccess("תת־הקטגוריה נוספה בהצלחה.");
      }

      closeSubcategoryForm();
      await loadData();
    } catch (saveError) {
      console.error("Error saving subcategory:", saveError);

      const message = getErrorMessage(saveError);

      if (message.includes("duplicate key")) {
        setError(
          "כבר קיימת תת־קטגוריה עם ה־slug הזה בתוך הקטגוריה."
        );
      } else if (
        message.includes("לא ניתן לשנות slug")
      ) {
        setError(
          "לא ניתן לשנות את ה־slug של תת־קטגוריה שכבר משויכים אליה מוצרים."
        );
      } else {
        setError(message);
      }
    } finally {
      setSavingSubcategory(false);
    }
  }

  async function deleteSubcategory(
    subcategory: Subcategory
  ) {
    resetMessages();

    const approved = window.confirm(
      `למחוק את תת־הקטגוריה "${subcategory.name}"?\n\nאם קיימים בה מוצרים, Supabase יחסום את המחיקה.`
    );

    if (!approved) return;

    setDeletingId(`subcategory-${subcategory.id}`);

    try {
      const { error: deleteError } = await supabase
        .from("subcategories")
        .delete()
        .eq("id", subcategory.id);

      if (deleteError) throw deleteError;

      setSuccess("תת־הקטגוריה נמחקה.");
      await loadData();
    } catch (deleteError) {
      console.error(
        "Error deleting subcategory:",
        deleteError
      );

      const message = getErrorMessage(deleteError);

      if (
        message.includes("לא ניתן למחוק תת-קטגוריה")
      ) {
        setError(
          "אי אפשר למחוק את תת־הקטגוריה כי קיימים בה מוצרים. אפשר להסתיר אותה במקום."
        );
      } else {
        setError(message);
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleSubcategoryActive(
    subcategory: Subcategory
  ) {
    resetMessages();

    try {
      const { error: updateError } = await supabase
        .from("subcategories")
        .update({
          active: !subcategory.active,
        })
        .eq("id", subcategory.id);

      if (updateError) throw updateError;

      setSuccess(
        subcategory.active
          ? "תת־הקטגוריה הוסתרה."
          : "תת־הקטגוריה הופעלה."
      );

      await loadData();
    } catch (toggleError) {
      console.error(
        "Error toggling subcategory:",
        toggleError
      );
      setError(getErrorMessage(toggleError));
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-neutral-100 px-4 py-10"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-center py-24">
          <div className="text-center">
            <Loader2
              className="mx-auto animate-spin"
              size={30}
            />
            <p className="mt-3 text-sm text-gray-500">
              טוען קטגוריות...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-100 px-4 py-6 sm:px-6 sm:py-10"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-black"
            >
              <ArrowRight size={17} />
              חזרה ללוח הבקרה
            </Link>

            <h1 className="text-3xl font-semibold">
              ניהול קטגוריות
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              הוספה, עריכה, הסתרה וניהול תתי־קטגוריות.
            </p>
          </div>

          <button
            type="button"
            onClick={openNewCategory}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:bg-neutral-800"
          >
            <Plus size={19} />
            הוספת קטגוריה
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-800"
          >
            {success}
          </div>
        )}

        {showCategoryForm && (
          <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {editingCategoryId !== null
                    ? "עריכת קטגוריה"
                    : "קטגוריה חדשה"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  שם הקטגוריה יכול להיות בעברית. ה־slug חייב להיות באנגלית.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCategoryForm}
                aria-label="סגירה"
                className="rounded-lg p-2 transition hover:bg-neutral-100"
              >
                <X size={21} />
              </button>
            </div>

            <form
              onSubmit={saveCategory}
              className="grid gap-4 sm:grid-cols-2"
            >
              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  שם הקטגוריה *
                </span>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={categoryForm.name}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="min-h-12 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-black"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Slug *
                </span>
                <input
                  dir="ltr"
                  type="text"
                  required
                  value={categoryForm.slug}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      slug: cleanSlug(event.target.value),
                    }))
                  }
                  placeholder="living-room"
                  className="min-h-12 w-full rounded-xl border border-gray-300 px-4 text-left outline-none focus:border-black"
                />
                <span className="mt-1 block text-xs text-gray-400">
                  משמש בכתובת האתר. לא מומלץ לשנות אחרי שיש מוצרים.
                </span>
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium">
                  כתובת תמונה
                </span>
                <input
                  dir="ltr"
                  type="text"
                  value={categoryForm.image_url}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      image_url: event.target.value,
                    }))
                  }
                  placeholder="/images/categories/example.png"
                  className="min-h-12 w-full rounded-xl border border-gray-300 px-4 text-left outline-none focus:border-black"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  סדר הופעה
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={categoryForm.sort_order}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      sort_order: event.target.value,
                    }))
                  }
                  className="min-h-12 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-black"
                />
              </label>

              <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
                <ToggleField
                  label="פעילה"
                  checked={categoryForm.active}
                  onChange={(checked) =>
                    setCategoryForm((current) => ({
                      ...current,
                      active: checked,
                    }))
                  }
                />

                <ToggleField
                  label="הצג בתפריט"
                  checked={categoryForm.show_in_nav}
                  onChange={(checked) =>
                    setCategoryForm((current) => ({
                      ...current,
                      show_in_nav: checked,
                    }))
                  }
                />

                <ToggleField
                  label="הצג בדף הבית"
                  checked={categoryForm.show_on_homepage}
                  onChange={(checked) =>
                    setCategoryForm((current) => ({
                      ...current,
                      show_on_homepage: checked,
                    }))
                  }
                />
              </div>

              <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {savingCategory ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={18} />
                  )}

                  {savingCategory
                    ? "שומר..."
                    : "שמירה"}
                </button>

                <button
                  type="button"
                  onClick={closeCategoryForm}
                  disabled={savingCategory}
                  className="min-h-12 rounded-xl border border-gray-300 px-6 py-3 font-medium transition hover:border-black"
                >
                  ביטול
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="space-y-4">
          {categories.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
              <ImageIcon
                size={42}
                className="mx-auto text-gray-300"
              />
              <h2 className="mt-4 text-xl font-semibold">
                אין קטגוריות
              </h2>
              <p className="mt-2 text-gray-500">
                לחץ על "הוספת קטגוריה" כדי להתחיל.
              </p>
            </div>
          ) : (
            categories.map((category) => {
              const categorySubs =
                subcategories.filter(
                  (item) =>
                    item.category_id === category.id
                );

              const expanded =
                expandedCategoryIds.includes(
                  category.id
                );

              return (
                <article
                  key={category.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
                          {category.image_url ? (
                            <img
                              src={category.image_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon
                              size={24}
                              className="text-gray-300"
                            />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-semibold">
                              {category.name}
                            </h2>

                            <StatusBadge
                              active={category.active}
                            />
                          </div>

                          <p
                            dir="ltr"
                            className="mt-1 truncate text-left text-xs text-gray-400"
                          >
                            {category.slug}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span>
                              סדר: {category.sort_order}
                            </span>
                            <span>
                              {categorySubs.length} תתי־קטגוריות
                            </span>
                            <span>
                              {category.show_in_nav
                                ? "מוצגת בתפריט"
                                : "לא בתפריט"}
                            </span>
                            <span>
                              {category.show_on_homepage
                                ? "מוצגת בדף הבית"
                                : "לא בדף הבית"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            toggleExpanded(category.id)
                          }
                          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm transition hover:border-black"
                        >
                          {expanded ? (
                            <ChevronUp size={17} />
                          ) : (
                            <ChevronDown size={17} />
                          )}
                          תתי־קטגוריות
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openEditCategory(category)
                          }
                          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm transition hover:border-black"
                        >
                          <Pencil size={16} />
                          עריכה
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void toggleCategoryActive(
                              category
                            )
                          }
                          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm transition hover:border-black"
                        >
                          {category.active ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                          {category.active
                            ? "הסתרה"
                            : "הפעלה"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void deleteCategory(category)
                          }
                          disabled={
                            deletingId ===
                            `category-${category.id}`
                          }
                          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId ===
                          `category-${category.id}` ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={16} />
                          )}
                          מחיקה
                        </button>
                      </div>
                    </div>
                  </div>

                  {expanded && (
                    <div className="border-t border-gray-200 bg-neutral-50 p-5 sm:p-6">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-semibold">
                            תתי־קטגוריות
                          </h3>
                          <p className="mt-1 text-xs text-gray-500">
                            קטגוריית אב: {category.name}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            openNewSubcategory(category.id)
                          }
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
                        >
                          <Plus size={16} />
                          הוספת תת־קטגוריה
                        </button>
                      </div>

                      {subcategoryCategoryId ===
                        category.id && (
                        <SubcategoryEditor
                          form={subcategoryForm}
                          setForm={setSubcategoryForm}
                          editing={
                            editingSubcategoryId !== null
                          }
                          saving={savingSubcategory}
                          onSubmit={saveSubcategory}
                          onCancel={closeSubcategoryForm}
                        />
                      )}

                      <div className="mt-4 space-y-2">
                        {categorySubs.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
                            עדיין אין תתי־קטגוריות.
                          </div>
                        ) : (
                          categorySubs.map(
                            (subcategory) => (
                              <div
                                key={subcategory.id}
                                className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium">
                                      {subcategory.name}
                                    </p>
                                    <StatusBadge
                                      active={
                                        subcategory.active
                                      }
                                    />
                                  </div>

                                  <p
                                    dir="ltr"
                                    className="mt-1 truncate text-left text-xs text-gray-400"
                                  >
                                    {subcategory.slug}
                                  </p>

                                  <p className="mt-1 text-xs text-gray-500">
                                    סדר:{" "}
                                    {
                                      subcategory.sort_order
                                    }
                                    {" • "}
                                    {subcategory.show_in_nav
                                      ? "בתפריט"
                                      : "לא בתפריט"}
                                    {" • "}
                                    {subcategory.show_on_homepage
                                      ? "בדף הבית"
                                      : "לא בדף הבית"}
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditSubcategory(
                                        subcategory
                                      )
                                    }
                                    className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-xs transition hover:border-black"
                                  >
                                    <Pencil size={14} />
                                    עריכה
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      void toggleSubcategoryActive(
                                        subcategory
                                      )
                                    }
                                    className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-xs transition hover:border-black"
                                  >
                                    {subcategory.active ? (
                                      <EyeOff size={14} />
                                    ) : (
                                      <Eye size={14} />
                                    )}
                                    {subcategory.active
                                      ? "הסתרה"
                                      : "הפעלה"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      void deleteSubcategory(
                                        subcategory
                                      )
                                    }
                                    disabled={
                                      deletingId ===
                                      `subcategory-${subcategory.id}`
                                    }
                                    className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                                  >
                                    {deletingId ===
                                    `subcategory-${subcategory.id}` ? (
                                      <Loader2
                                        size={14}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Trash2
                                        size={14}
                                      />
                                    )}
                                    מחיקה
                                  </button>
                                </div>
                              </div>
                            )
                          )
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
      <span className="text-sm font-medium">
        {label}
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="h-4 w-4 accent-black"
      />
    </label>
  );
}

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={
        active
          ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800"
          : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
      }
    >
      {active ? "פעילה" : "מוסתרת"}
    </span>
  );
}

function SubcategoryEditor({
  form,
  setForm,
  editing,
  saving,
  onSubmit,
  onCancel,
}: {
  form: SubcategoryForm;
  setForm: React.Dispatch<
    React.SetStateAction<SubcategoryForm>
  >;
  editing: boolean;
  saving: boolean;
  onSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
  onCancel: () => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="mb-5 grid gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <h4 className="font-semibold">
          {editing
            ? "עריכת תת־קטגוריה"
            : "תת־קטגוריה חדשה"}
        </h4>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium">
          שם *
        </span>
        <input
          type="text"
          required
          maxLength={100}
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              name: event.target.value,
            }))
          }
          className="min-h-11 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-black"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium">
          Slug *
        </span>
        <input
          dir="ltr"
          type="text"
          required
          value={form.slug}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              slug: cleanSlug(event.target.value),
            }))
          }
          placeholder="coffee-tables"
          className="min-h-11 w-full rounded-lg border border-gray-300 px-3 text-left outline-none focus:border-black"
        />
      </label>

      <label className="block sm:col-span-2">
        <span className="mb-2 block text-sm font-medium">
          כתובת תמונה
        </span>
        <input
          dir="ltr"
          type="text"
          value={form.image_url}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              image_url: event.target.value,
            }))
          }
          className="min-h-11 w-full rounded-lg border border-gray-300 px-3 text-left outline-none focus:border-black"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium">
          סדר הופעה
        </span>
        <input
          type="number"
          min="0"
          step="1"
          value={form.sort_order}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              sort_order: event.target.value,
            }))
          }
          className="min-h-11 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-black"
        />
      </label>

      <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
        <ToggleField
          label="פעילה"
          checked={form.active}
          onChange={(checked) =>
            setForm((current) => ({
              ...current,
              active: checked,
            }))
          }
        />

        <ToggleField
          label="הצג בתפריט"
          checked={form.show_in_nav}
          onChange={(checked) =>
            setForm((current) => ({
              ...current,
              show_in_nav: checked,
            }))
          }
        />

        <ToggleField
          label="הצג בדף הבית"
          checked={form.show_on_homepage}
          onChange={(checked) =>
            setForm((current) => ({
              ...current,
              show_on_homepage: checked,
            }))
          }
        />
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:bg-gray-400"
        >
          {saving ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <Save size={16} />
          )}

          {saving ? "שומר..." : "שמירה"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="min-h-11 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}
