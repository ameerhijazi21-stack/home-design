"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  Search,
Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Headphones,
  BadgeCheck,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Menu,
  X,
  ChevronDown,
  Gift,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { supabase } from "../lib/supabase";
import ProductCard from "../components/ProductCard";
import {
  getFeaturedProducts,
  searchProducts,
  type Product,
} from "../lib/products";


type StoreCategory = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  active: boolean;
  show_in_nav: boolean;
  show_on_homepage: boolean;
};

type StoreSubcategory = {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  active: boolean;
  show_in_nav: boolean;
  show_on_homepage: boolean;
};

type HomepageCategoryCard = {
  name: string;
  image: string;
  href: string;
  sortKey: number;
};

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState("");
  const [contactError, setContactError] = useState("");

  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);


  const [storeCategories, setStoreCategories] = useState<StoreCategory[]>([]);
  const [storeSubcategories, setStoreSubcategories] =
    useState<StoreSubcategory[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const [siteImages, setSiteImages] = useState<Record<string, string>>({
    hero: "/images/hero.webp",
    category_dining: "/images/categories/tables.png",
    category_armchairs: "/images/categories/armchairs.png",
    category_coffee: "/images/categories/tables.png",
    category_decor: "/images/categories/decor.png",
    category_mattresses: "/images/categories/mattresses.png",
    custom_sofas: "/images/categories/sofas.webp",
    sale: "/images/sale.png",
  });

  useEffect(() => {
    async function loadSiteImages() {
      const { data, error } = await supabase
        .from("site_images")
        .select("image_key, image_url");

      if (error) {
        console.error("Error loading site images:", error);
        return;
      }

      const nextImages: Record<string, string> = {};

      for (const item of data || []) {
        if (item.image_key && item.image_url) {
          nextImages[item.image_key] = item.image_url;
        }
      }

      setSiteImages((current) => ({
        ...current,
        ...nextImages,
      }));
    }

    loadSiteImages();
  }, []);

  useEffect(() => {
    async function loadStoreCategories() {
      const [categoriesResult, subcategoriesResult] =
        await Promise.all([
          supabase
            .from("categories")
            .select(
              "id, name, slug, image_url, sort_order, active, show_in_nav, show_on_homepage"
            )
            .eq("active", true)
            .order("sort_order", { ascending: true }),

          supabase
            .from("subcategories")
            .select(
              "id, category_id, name, slug, image_url, sort_order, active, show_in_nav, show_on_homepage"
            )
            .eq("active", true)
            .order("sort_order", { ascending: true }),
        ]);

      if (categoriesResult.error) {
        console.error(
          "Error loading categories:",
          categoriesResult.error
        );
      } else {
        setStoreCategories(
          (categoriesResult.data || []) as StoreCategory[]
        );
        setCategoriesLoaded(true);
      }

      if (subcategoriesResult.error) {
        console.error(
          "Error loading subcategories:",
          subcategoriesResult.error
        );
      } else {
        setStoreSubcategories(
          (subcategoriesResult.data || []) as StoreSubcategory[]
        );
      }
    }

    loadStoreCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const products = await getFeaturedProducts();
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error loading homepage products:", error);
      } finally {
        setProductsLoading(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    if (!searchOpen) return;

    const query = searchTerm.trim();

    if (!query) {
      setSearchResults([]);
      setSearchPerformed(false);
      setSearchLoading(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchPerformed(true);
        const results = await searchProducts(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching products:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchTerm, searchOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchOpen &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        closeSearch();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchTerm.trim();

    if (!query) {
      setSearchResults([]);
      setSearchPerformed(false);
      return;
    }

    try {
      setSearchLoading(true);
      setSearchPerformed(true);

      const results = await searchProducts(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchTerm("");
    setSearchResults([]);
    setSearchPerformed(false);
  }

  async function handleContactSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const fullName = contactName.trim();
    const phone = contactPhone.trim();
    const subject = contactSubject.trim();
    const message = contactMessage.trim();

    setContactSuccess("");
    setContactError("");

    if (!fullName || !phone || !subject) {
      setContactError("יש למלא שם מלא, טלפון ונושא.");
      return;
    }

    if (!/^0\d{8,9}$/.test(phone.replace(/[-\s]/g, ""))) {
      setContactError("נא להזין מספר טלפון תקין.");
      return;
    }

    try {
      setContactLoading(true);

      const { error } = await supabase
        .from("contact_messages")
        .insert({
          full_name: fullName,
          phone,
          subject,
          message: message || null,
          status: "new",
        });

      if (error) {
        throw error;
      }

      setContactName("");
      setContactPhone("");
      setContactSubject("");
      setContactMessage("");
      setContactSuccess(
        "הפרטים נשלחו בהצלחה. ניצור איתכם קשר בהקדם."
      );
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setContactError(
        "לא הצלחנו לשלוח את הפרטים כרגע. אפשר לנסות שוב או לפנות אלינו ב-WhatsApp."
      );
    } finally {
      setContactLoading(false);
    }
  }

  const fallbackHomepageCategories: HomepageCategoryCard[] = [
    {
      name: "פינות אוכל",
      image: siteImages.category_dining,
      href: "/category/tables?sub=dining-tables",
      sortKey: 10,
    },
    {
      name: "כיסאות וכורסאות",
      image: siteImages.category_armchairs,
      href: "/category/armchairs",
      sortKey: 20,
    },
    {
      name: "שולחנות סלון",
      image: siteImages.category_coffee,
      href: "/category/tables?sub=coffee-tables",
      sortKey: 30,
    },
    {
      name: "עיצוב לבית",
      image: siteImages.category_decor,
      href: "/category/decor",
      sortKey: 40,
    },
    {
      name: "מזרנים",
      image: siteImages.category_mattresses,
      href: "/category/mattresses",
      sortKey: 50,
    },
  ];

  function fallbackCategoryImage(slug: string) {
    switch (slug) {
      case "armchairs":
        return siteImages.category_armchairs;
      case "tables":
        return siteImages.category_dining;
      case "decor":
        return siteImages.category_decor;
      case "mattresses":
        return siteImages.category_mattresses;
      default:
        return "/images/categories/decor.png";
    }
  }

  function fallbackSubcategoryImage(
    slug: string,
    parentSlug: string
  ) {
    if (slug === "dining-tables") {
      return siteImages.category_dining;
    }

    if (slug === "coffee-tables") {
      return siteImages.category_coffee;
    }

    return fallbackCategoryImage(parentSlug);
  }

  const dynamicHomepageCategories: HomepageCategoryCard[] = [
    ...storeCategories
      .filter((category) => category.show_on_homepage)
      .map((category) => ({
        name: category.name,
        image:
          category.image_url ||
          fallbackCategoryImage(category.slug),
        href: `/category/${category.slug}`,
        sortKey: category.sort_order * 100,
      })),

    ...storeSubcategories
      .filter((subcategory) => subcategory.show_on_homepage)
      .map((subcategory) => {
        const parent = storeCategories.find(
          (category) =>
            category.id === subcategory.category_id
        );

        if (!parent) {
          return null;
        }

        return {
          name: subcategory.name,
          image:
            subcategory.image_url ||
            fallbackSubcategoryImage(
              subcategory.slug,
              parent.slug
            ),
          href: `/category/${parent.slug}?sub=${encodeURIComponent(
            subcategory.slug
          )}`,
          sortKey:
            parent.sort_order * 100 +
            subcategory.sort_order,
        };
      })
      .filter(
        (
          item
        ): item is HomepageCategoryCard =>
          item !== null
      ),
  ].sort((a, b) => a.sortKey - b.sortKey);

  const categories =
    categoriesLoaded
      ? dynamicHomepageCategories
      : fallbackHomepageCategories;

  const footerCategories =
    categoriesLoaded
      ? storeCategories
          .filter((category) => category.show_in_nav)
          .sort(
            (a, b) =>
              a.sort_order - b.sort_order
          )
      : [];

  const fallbackNavCategories: StoreCategory[] = [
    {
      id: -1,
      name: "כיסאות וכורסאות",
      slug: "armchairs",
      image_url: null,
      sort_order: 1,
      active: true,
      show_in_nav: true,
      show_on_homepage: true,
    },
    {
      id: -2,
      name: "פינות אוכל ושולחנות",
      slug: "tables",
      image_url: null,
      sort_order: 2,
      active: true,
      show_in_nav: true,
      show_on_homepage: true,
    },
    {
      id: -3,
      name: "מזנונים וקונסולות",
      slug: "storage",
      image_url: null,
      sort_order: 3,
      active: true,
      show_in_nav: true,
      show_on_homepage: false,
    },
    {
      id: -4,
      name: "מזרנים",
      slug: "mattresses",
      image_url: null,
      sort_order: 4,
      active: true,
      show_in_nav: true,
      show_on_homepage: true,
    },
    {
      id: -5,
      name: "עיצוב לבית",
      slug: "decor",
      image_url: null,
      sort_order: 5,
      active: true,
      show_in_nav: true,
      show_on_homepage: true,
    },
  ];

  const fallbackNavSubcategories: StoreSubcategory[] = [
    {
      id: -11,
      category_id: -1,
      name: "כיסאות אוכל",
      slug: "dining-chairs",
      image_url: null,
      sort_order: 1,
      active: true,
      show_in_nav: true,
      show_on_homepage: false,
    },
    {
      id: -12,
      category_id: -1,
      name: "כיסאות בר",
      slug: "bar-chairs",
      image_url: null,
      sort_order: 2,
      active: true,
      show_in_nav: true,
      show_on_homepage: false,
    },
    {
      id: -13,
      category_id: -1,
      name: "כורסאות",
      slug: "armchairs",
      image_url: null,
      sort_order: 3,
      active: true,
      show_in_nav: true,
      show_on_homepage: false,
    },
    {
      id: -21,
      category_id: -2,
      name: "פינות אוכל",
      slug: "dining-tables",
      image_url: null,
      sort_order: 1,
      active: true,
      show_in_nav: true,
      show_on_homepage: true,
    },
    {
      id: -22,
      category_id: -2,
      name: "שולחנות סלון",
      slug: "coffee-tables",
      image_url: null,
      sort_order: 2,
      active: true,
      show_in_nav: true,
      show_on_homepage: true,
    },
    {
      id: -23,
      category_id: -2,
      name: "שולחנות צד",
      slug: "side-tables",
      image_url: null,
      sort_order: 3,
      active: true,
      show_in_nav: true,
      show_on_homepage: false,
    },
    {
      id: -41,
      category_id: -4,
      name: "יחיד",
      slug: "single",
      image_url: null,
      sort_order: 1,
      active: true,
      show_in_nav: true,
      show_on_homepage: false,
    },
    {
      id: -42,
      category_id: -4,
      name: "מיטה וחצי",
      slug: "one-and-half",
      image_url: null,
      sort_order: 2,
      active: true,
      show_in_nav: true,
      show_on_homepage: false,
    },
    {
      id: -43,
      category_id: -4,
      name: "זוגי",
      slug: "double",
      image_url: null,
      sort_order: 3,
      active: true,
      show_in_nav: true,
      show_on_homepage: false,
    },
    {
      id: -51,
      category_id: -5,
      name: "מראות",
      slug: "mirrors",
      image_url: null,
      sort_order: 1,
      active: true,
      show_in_nav: true,
      show_on_homepage: false,
    },
    {
      id: -52,
      category_id: -5,
      name: "תאורה",
      slug: "lighting",
      image_url: null,
      sort_order: 2,
      active: true,
      show_in_nav: true,
      show_on_homepage: false,
    },
    {
      id: -53,
      category_id: -5,
      name: "אקססוריז",
      slug: "accessories",
      image_url: null,
      sort_order: 3,
      active: true,
      show_in_nav: true,
      show_on_homepage: false,
    },
  ];

  const effectiveNavCategories = (
    categoriesLoaded
      ? storeCategories
      : fallbackNavCategories
  )
    .filter((category) => category.show_in_nav)
    .sort((a, b) => a.sort_order - b.sort_order);

  const effectiveNavSubcategories =
    categoriesLoaded
      ? storeSubcategories
      : fallbackNavSubcategories;

  const furnitureCategorySlugs = new Set([
    "armchairs",
    "tables",
    "storage",
  ]);

  const furnitureCategories =
    effectiveNavCategories.filter((category) =>
      furnitureCategorySlugs.has(category.slug)
    );

  const standaloneNavCategories =
    effectiveNavCategories.filter(
      (category) =>
        !furnitureCategorySlugs.has(category.slug)
    );

  function getNavSubcategories(categoryId: number) {
    return effectiveNavSubcategories
      .filter(
        (subcategory) =>
          subcategory.category_id === categoryId &&
          subcategory.show_in_nav
      )
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  return (
    <main className="min-h-screen bg-white text-black">
      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-50 bg-white">
        {/* TOP BAR */}

        <div className="hidden border-b border-gray-200 bg-neutral-50 lg:block">
          <div
            dir="rtl"
            className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5 text-sm"
          >
            <div className="flex items-center gap-2">
              <Gift size={17} strokeWidth={1.6} />
              <span>מבצע עד 30% הנחה על מגוון מוצרים</span>
            </div>

            <div className="flex items-center gap-8 text-gray-700">
              <div className="flex items-center gap-2">
                <Headphones size={17} strokeWidth={1.6} />
                <span>שירות לקוחות</span>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck size={17} strokeWidth={1.6} />
                <span>תשלום מאובטח</span>
              </div>

              <div className="flex items-center gap-2">
                <Truck size={17} strokeWidth={1.6} />
                <span>משלוחים לכל הארץ</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN HEADER */}

        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-4 py-4 sm:px-6">
            {/* ICONS */}

            <div className="flex items-center gap-5">
              {/* CART */}

              <Link
                href="/cart"
                aria-label="סל קניות"
                className="relative hidden transition hover:text-gray-500 md:block"
              >
                <ShoppingBag size={25} strokeWidth={1.7} />

                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* FAVORITES */}

              <Link
                href="/favorites"
                aria-label="מועדפים"
                className="relative hidden transition hover:text-gray-500 md:block"
              >
                <Heart size={25} strokeWidth={1.7} />

                {favoritesCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs text-white">
                    {favoritesCount}
                  </span>
                )}
              </Link>
{/* SEARCH */}

              <button
                type="button"
                aria-label="חיפוש"
                onClick={() => setSearchOpen(!searchOpen)}
                className="transition hover:text-gray-500"
              >
                <Search size={25} strokeWidth={1.7} />
              </button>
            </div>

            {/* LOGO */}

            <div className="flex justify-center">
              <Link href="/">
                <img
                  src="/images/new-logo.webp"
                  alt="Home Design"
                  width={220}
                  height={90}
                  decoding="async"
                  className="h-14 w-auto object-contain sm:h-16"
                />
              </Link>
            </div>

            {/* MOBILE MENU */}

            <div className="flex justify-end md:hidden">
              <button
                type="button"
                aria-label="תפריט"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? (
                  <X size={27} strokeWidth={1.7} />
                ) : (
                  <Menu size={27} strokeWidth={1.7} />
                )}
              </button>
            </div>

            <div className="hidden md:block" />
          </div>
        </div>

        {/* ================= SEARCH ================= */}

        {searchOpen && (
          <div className="border-b border-gray-200 bg-white">
            <div
              ref={searchContainerRef}
              className="mx-auto max-w-5xl px-5 py-5"
            >
              <form
                dir="rtl"
                onSubmit={handleSearch}
                className="flex items-center gap-3 border-b border-black pb-2"
              >
                <Search size={21} />

                <input
                  type="text"
                  autoFocus
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);

                    if (!event.target.value.trim()) {
                      setSearchResults([]);
                      setSearchPerformed(false);
                    }
                  }}
                  placeholder="מה תרצו לחפש?"
                  className="w-full bg-transparent py-2 text-lg outline-none"
                />

                <button
                  type="submit"
                  className="shrink-0 bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  חיפוש
                </button>

                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="סגור חיפוש"
                >
                  <X size={21} />
                </button>
              </form>

              {searchLoading && (
                <div
                  dir="rtl"
                  className="py-8 text-center text-sm text-gray-500"
                >
                  מחפש מוצרים...
                </div>
              )}

              {!searchLoading &&
                searchPerformed &&
                searchResults.length === 0 && (
                  <div
                    dir="rtl"
                    className="py-8 text-center"
                  >
                    <p className="font-medium">
                      לא נמצאו מוצרים
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      נסו לחפש בשם מוצר אחר.
                    </p>
                  </div>
                )}

              {!searchLoading &&
                searchResults.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 py-5 sm:grid-cols-2">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={closeSearch}
                        className="flex items-center gap-4 border border-gray-200 p-3 transition hover:border-black"
                      >
                        <div className="h-20 w-20 shrink-0 overflow-hidden bg-neutral-100">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              width={160}
                              height={160}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                              אין תמונה
                            </div>
                          )}
                        </div>

                        <div dir="rtl" className="min-w-0 flex-1">
                          <h3 className="truncate font-medium">
                            {product.name}
                          </h3>

                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm font-medium">
                              ₪{Number(product.price).toLocaleString("he-IL")}
                            </span>

                            {product.old_price !== null &&
                              Number(product.old_price) > Number(product.price) && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₪{Number(product.old_price).toLocaleString("he-IL")}
                                </span>
                              )}
                          </div>

                          <span className="mt-2 inline-block text-xs text-gray-400">
                            לצפייה במוצר ←
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* ================= DESKTOP NAVIGATION ================= */}

        <nav className="hidden border-b border-gray-200 bg-white md:block">
          <div
            dir="rtl"
            className="mx-auto flex h-[58px] max-w-7xl items-center justify-center gap-8 px-6"
          >
            {furnitureCategories.length > 0 && (
              <div className="group relative flex h-full items-center">
                <button
                  type="button"
                  className="flex h-full items-center gap-1 text-[15px] font-medium"
                >
                  רהיטים
                  <ChevronDown
                    size={15}
                    strokeWidth={1.8}
                    className="transition duration-200 group-hover:rotate-180"
                  />
                </button>

                <span className="absolute bottom-0 right-0 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full" />

                <div className="invisible absolute right-1/2 top-full z-50 w-[820px] translate-x-1/2 translate-y-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="grid grid-cols-[1.15fr_0.85fr] gap-8 border border-gray-200 bg-white p-7 shadow-xl">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-7">
                      {furnitureCategories.map((category) => {
                        const subcategories =
                          getNavSubcategories(category.id);

                        return (
                          <div key={category.id}>
                            <Link
                              href={`/category/${category.slug}`}
                              className="font-semibold transition hover:text-gray-500"
                            >
                              {category.name}
                            </Link>

                            {subcategories.length > 0 && (
                              <div className="mt-3 flex flex-col gap-2 text-sm text-gray-600">
                                {subcategories.map(
                                  (subcategory) => (
                                    <Link
                                      key={subcategory.id}
                                      href={`/category/${category.slug}?sub=${encodeURIComponent(
                                        subcategory.slug
                                      )}`}
                                      className="transition hover:text-black"
                                    >
                                      {subcategory.name}
                                    </Link>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <Link
                      href="/custom-sofas"
                      className="group/card relative min-h-[210px] overflow-hidden"
                    >
                      <img
                        src={siteImages.custom_sofas}
                        alt="ספות בהתאמה אישית"
                        width={800}
                        height={500}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover/card:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/35" />
                      <div className="absolute bottom-0 right-0 p-5 text-white">
                        <p className="text-lg font-semibold">
                          ספות בהתאמה אישית
                        </p>
                        <p className="mt-1 text-sm">
                          לתכנון הספה שלכם ←
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {standaloneNavCategories.map((category) => {
              const subcategories =
                getNavSubcategories(category.id);

              if (subcategories.length === 0) {
                return (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="group relative flex h-full items-center text-[15px] font-medium"
                  >
                    {category.name}
                    <span className="absolute bottom-0 right-0 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full" />
                  </Link>
                );
              }

              return (
                <div
                  key={category.id}
                  className="group relative flex h-full items-center"
                >
                  <button
                    type="button"
                    className="flex h-full items-center gap-1 text-[15px] font-medium"
                  >
                    {category.name}
                    <ChevronDown
                      size={15}
                      strokeWidth={1.8}
                      className="transition duration-200 group-hover:rotate-180"
                    />
                  </button>

                  <span className="absolute bottom-0 right-0 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full" />

                  <div className="invisible absolute right-1/2 top-full z-50 min-w-[260px] translate-x-1/2 translate-y-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="border border-gray-200 bg-white p-5 shadow-xl">
                      <Link
                        href={`/category/${category.slug}`}
                        className="mb-4 block font-semibold transition hover:text-gray-500"
                      >
                        כל {category.name}
                      </Link>

                      <div className="flex flex-col gap-3 text-sm text-gray-600">
                        {subcategories.map((subcategory) => (
                          <Link
                            key={subcategory.id}
                            href={`/category/${category.slug}?sub=${encodeURIComponent(
                              subcategory.slug
                            )}`}
                            className="transition hover:text-black"
                          >
                            {subcategory.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <Link
              href="/custom-sofas"
              className="group relative flex h-full items-center text-[15px] font-medium"
            >
              ספות בהתאמה אישית
              <span className="absolute bottom-0 right-0 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full" />
            </Link>

            <Link
              href="/new"
              className="group relative flex h-full items-center text-[15px] font-medium"
            >
              חדש
              <span className="absolute bottom-0 right-0 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full" />
            </Link>

            <Link
              href="/sale"
              className="group relative flex h-full items-center text-[15px] font-semibold"
            >
              SALE
              <span className="absolute bottom-0 right-0 h-[2px] w-full bg-black" />
            </Link>
          </div>
        </nav>

        {/* ================= MOBILE MENU ================= */}

        {menuOpen && (
          <div
            dir="rtl"
            className="border-b border-gray-200 bg-white px-6 py-6 md:hidden"
          >
            <div className="flex flex-col gap-5 text-right">
              {furnitureCategories.length > 0 && (
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                    <span>רהיטים</span>
                    <ChevronDown
                      size={17}
                      className="transition group-open:rotate-180"
                    />
                  </summary>

                  <div className="mt-4 space-y-5 border-r border-gray-200 pr-4">
                    {furnitureCategories.map((category) => {
                      const subcategories =
                        getNavSubcategories(category.id);

                      return (
                        <div key={category.id}>
                          <Link
                            href={`/category/${category.slug}`}
                            onClick={() => setMenuOpen(false)}
                            className="font-medium"
                          >
                            {category.name}
                          </Link>

                          {subcategories.length > 0 && (
                            <div className="mt-2 flex flex-col gap-2 text-sm text-gray-500">
                              {subcategories.map(
                                (subcategory) => (
                                  <Link
                                    key={subcategory.id}
                                    href={`/category/${category.slug}?sub=${encodeURIComponent(
                                      subcategory.slug
                                    )}`}
                                    onClick={() =>
                                      setMenuOpen(false)
                                    }
                                  >
                                    {subcategory.name}
                                  </Link>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </details>
              )}

              {standaloneNavCategories.map((category) => {
                const subcategories =
                  getNavSubcategories(category.id);

                if (subcategories.length === 0) {
                  return (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  );
                }

                return (
                  <details key={category.id} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between">
                      <span>{category.name}</span>
                      <ChevronDown
                        size={17}
                        className="transition group-open:rotate-180"
                      />
                    </summary>

                    <div className="mt-3 flex flex-col gap-3 border-r border-gray-200 pr-4 text-sm text-gray-500">
                      <Link
                        href={`/category/${category.slug}`}
                        onClick={() => setMenuOpen(false)}
                        className="font-medium text-black"
                      >
                        כל {category.name}
                      </Link>

                      {subcategories.map((subcategory) => (
                        <Link
                          key={subcategory.id}
                          href={`/category/${category.slug}?sub=${encodeURIComponent(
                            subcategory.slug
                          )}`}
                          onClick={() => setMenuOpen(false)}
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  </details>
                );
              })}

              <Link
                href="/custom-sofas"
                onClick={() => setMenuOpen(false)}
              >
                ספות בהתאמה אישית
              </Link>

              <Link
                href="/new"
                onClick={() => setMenuOpen(false)}
              >
                חדש
              </Link>

              <Link
                href="/sale"
                onClick={() => setMenuOpen(false)}
                className="font-semibold"
              >
                SALE
              </Link>

              <div className="mt-2 border-t border-gray-200 pt-5">
                <div className="flex items-center gap-6">
                  <Link
                    href="/favorites"
                    onClick={() => setMenuOpen(false)}
                    aria-label="מועדפים"
                    className="relative"
                  >
                    <Heart size={23} />

                    {favoritesCount > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs text-white">
                        {favoritesCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/cart"
                    onClick={() => setMenuOpen(false)}
                    className="relative"
                  >
                    <ShoppingBag size={23} />

                    {cartCount > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs text-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ================= HERO ================= */}

      <section className="relative h-[470px] w-full overflow-hidden sm:h-[550px] lg:h-[620px]">
        <img
          src={siteImages.hero}
          alt="Home Design"
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/25">
          <div
            dir="rtl"
            className="mx-auto flex h-full max-w-7xl items-center px-5 sm:px-8"
          >
            <div className="max-w-2xl text-right text-white">
              <h1 className="mb-4 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                הבית מתחיל בעיצוב
              </h1>

              <p className="mb-7 max-w-xl text-lg sm:text-xl lg:text-2xl">
                קולקציית ריהוט ועיצוב לבית בסגנון מודרני
              </p>

              <a
                href="#categories"
                className="inline-block bg-white px-8 py-3 text-base font-medium text-black transition hover:bg-gray-200 sm:px-10 sm:py-4 sm:text-lg"
              >
                לצפייה בקולקציה
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}

      <section id="categories" className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div dir="rtl" className="mb-12 text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">
              קטגוריות נבחרות
            </h2>

            <p className="mt-3 text-gray-500">
              כל מה שצריך כדי לעצב את הבית שלכם
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                href={category.href}
                key={category.name}
                className="group block"
              >
                <div className="overflow-hidden bg-gray-100">
                  <img
                    src={category.image}
                    alt={category.name}
                    width={800}
                    height={700}
                    loading="lazy"
                    decoding="async"
                    className="h-[220px] w-full object-cover transition duration-500 group-hover:scale-105 sm:h-[300px] lg:h-[350px]"
                  />
                </div>

                <div
                  dir="rtl"
                  className="pt-4 text-center"
                >
                  <h3 className="text-base font-medium sm:text-xl">
                    {category.name}
                  </h3>

                  <span className="mt-1 inline-block text-sm text-gray-500">
                    לצפייה במוצרים
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CUSTOM SOFAS ================= */}

      <section className="px-4 pb-14 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/custom-sofas"
            className="group relative block min-h-[320px] overflow-hidden sm:min-h-[400px]"
          >
            <img
              src={siteImages.custom_sofas}
              alt="ספות בהתאמה אישית"
              width={1600}
              height={900}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div
              dir="rtl"
              className="relative flex min-h-[320px] items-end p-7 text-white sm:min-h-[400px] sm:p-12"
            >
              <div className="max-w-xl">
                <p className="mb-3 text-sm font-medium tracking-[0.18em]">
                  CUSTOM MADE
                </p>
                <h2 className="text-3xl font-semibold sm:text-4xl">
                  ספות בהתאמה אישית
                </h2>
                <p className="mt-4 max-w-lg leading-7 text-white/90">
                  בוחרים מידות, בד, צבע ומבנה ומתכננים איתנו את הספה שמתאימה בדיוק לבית שלכם.
                </p>
                <span className="mt-6 inline-block border-b border-white pb-1 font-medium">
                  לתכנון הספה שלכם ←
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ================= FEATURED PRODUCTS ================= */}

      <section className="bg-neutral-50 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div dir="rtl" className="mb-10 text-center">
            <p className="mb-3 text-sm font-medium tracking-widest text-gray-500">
              HOME DESIGN
            </p>

            <h2 className="text-3xl font-semibold md:text-4xl">
              מוצרים נבחרים
            </h2>

            <p className="mt-3 text-gray-500">
              הפריטים שאנחנו הכי אוהבים
            </p>
          </div>

          {productsLoading ? (
            <div
              dir="rtl"
              className="py-14 text-center text-gray-500"
            >
              טוען מוצרים...
            </div>
          ) : featuredProducts.length === 0 ? (
            <div
              dir="rtl"
              className="rounded-xl bg-white px-6 py-14 text-center"
            >
              <h3 className="text-xl font-semibold">
                בקרוב מוצרים חדשים
              </h3>

              <p className="mt-2 text-gray-500">
                הקולקציה שלנו מתעדכנת.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= SALE ================= */}

      <section
        id="sale"
        className="px-4 pb-14 sm:px-6 sm:pb-20"
      >
        <div className="mx-auto max-w-7xl overflow-hidden">
          <Link
            href="/sale"
            className="group block"
            aria-label="לצפייה בכל מוצרי המבצע"
          >
            <img
              src={siteImages.sale}
              alt="Home Design Sale"
              width={1600}
              height={600}
              loading="lazy"
              decoding="async"
              className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.01]"
            />
          </Link>
        </div>
      </section>

      {/* ================= WHY US ================= */}

      <section className="border-y border-gray-200 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div dir="rtl" className="mb-10 text-center">
            <h2 className="text-3xl font-semibold">
              למה Home Design?
            </h2>

            <p className="mt-3 text-gray-500">
              חוויית קנייה פשוטה, איכותית ובטוחה
            </p>
          </div>

          <div
            dir="rtl"
            className="grid grid-cols-2 gap-10 text-center lg:grid-cols-4"
          >
            <div className="flex flex-col items-center">
              <Truck
                size={36}
                strokeWidth={1.4}
                className="mb-4"
              />

              <h3 className="mb-2 font-semibold">
                משלוחים לכל הארץ
              </h3>

              <p className="text-sm text-gray-500">
                שירות משלוחים נוח עד הבית
              </p>
            </div>

            <div className="flex flex-col items-center">
              <BadgeCheck
                size={36}
                strokeWidth={1.4}
                className="mb-4"
              />

              <h3 className="mb-2 font-semibold">
                איכות ללא פשרות
              </h3>

              <p className="text-sm text-gray-500">
                רהיטים ופריטי עיצוב שנבחרו בקפידה
              </p>
            </div>

            <div className="flex flex-col items-center">
              <Headphones
                size={36}
                strokeWidth={1.4}
                className="mb-4"
              />

              <h3 className="mb-2 font-semibold">
                שירות אישי
              </h3>

              <p className="text-sm text-gray-500">
                אנחנו כאן כדי לעזור לכם
              </p>
            </div>

            <div className="flex flex-col items-center">
              <ShieldCheck
                size={36}
                strokeWidth={1.4}
                className="mb-4"
              />

              <h3 className="mb-2 font-semibold">
                תשלום מאובטח
              </h3>

              <p className="text-sm text-gray-500">
                רכישה פשוטה ומאובטחת באתר
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}

      <section className="bg-neutral-100 py-14 sm:py-20">
        <div
          dir="rtl"
          className="mx-auto max-w-7xl px-6 text-center"
        >
          <p className="mb-3 text-sm font-medium tracking-widest">
            HOME DESIGN
          </p>

          <h2 className="mb-5 text-3xl font-semibold md:text-4xl">
            עיצוב שמשנה את הבית
          </h2>

          <p className="mx-auto max-w-2xl text-lg leading-8 text-gray-600">
            מגוון רהיטים ופריטי עיצוב שנבחרו כדי ליצור בית מודרני,
            נעים ומעוצב.
          </p>
        </div>
      </section>

      {/* ================= CONTACT ================= */}

      <section id="contact" className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div
            dir="rtl"
            className="overflow-hidden rounded-[28px] border border-gray-200 bg-neutral-50"
          >
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              {/* CONTACT DETAILS */}

              <div className="flex flex-col justify-between border-b border-gray-200 p-7 sm:p-10 lg:border-b-0 lg:border-l lg:p-12">
                <div>
                  <p className="text-sm font-medium tracking-[0.18em] text-gray-500">
                    HOME DESIGN
                  </p>

                  <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                    בואו נדבר
                  </h2>

                  <p className="mt-4 max-w-md leading-7 text-gray-600">
                    צריכים עזרה בבחירת מוצר, משלוח או ספה בהתאמה אישית?
                    אנחנו כאן כדי לעזור בצורה פשוטה ומהירה.
                  </p>

                  <div className="mt-10 space-y-3">
                    <a
                      href="tel:0505358197"
                      className="group flex items-center justify-between rounded-2xl bg-white p-4 transition hover:shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
                          <Phone size={20} strokeWidth={1.6} />
                        </span>
                        <div>
                          <p className="text-sm text-gray-500">טלפון</p>
                          <p dir="ltr" className="mt-0.5 font-medium">
                            050-535-8197
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-400 transition group-hover:-translate-x-1 group-hover:text-black">
                        ←
                      </span>
                    </a>

                    <a
                      href="https://wa.me/972505358197"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-2xl bg-white p-4 transition hover:shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
                          <MessageCircle size={20} strokeWidth={1.6} />
                        </span>
                        <div>
                          <p className="text-sm text-gray-500">WhatsApp</p>
                          <p className="mt-0.5 font-medium">שלחו לנו הודעה</p>
                        </div>
                      </div>
                      <span className="text-gray-400 transition group-hover:-translate-x-1 group-hover:text-black">
                        ←
                      </span>
                    </a>

                    <a
                      href="https://waze.com/ul/hsvc4bt30t"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-2xl bg-white p-4 transition hover:shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
                          <MapPin size={20} strokeWidth={1.6} />
                        </span>
                        <div>
                          <p className="text-sm text-gray-500">אולם התצוגה</p>
                          <p className="mt-0.5 font-medium">Home Design, טמרה</p>
                          <p className="mt-1 text-xs text-gray-400">ניווט עם Waze</p>
                        </div>
                      </div>
                      <span className="text-gray-400 transition group-hover:-translate-x-1 group-hover:text-black">
                        ←
                      </span>
                    </a>
                  </div>
                </div>

                <div className="mt-8 border-t border-gray-200 pt-6">
                  <a
                    href="https://www.instagram.com/homedesign.tamra?stkn=MXcybWVjaWF3d2NrNQ=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-2xl bg-white p-4 transition hover:shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white p-1.5">
                        <img
                          src="/images/new-logo.webp"
                          alt="Home Design"
                          width={220}
                          height={90}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-contain"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="font-medium">עקבו אחרינו באינסטגרם</p>
                        <p
                          dir="ltr"
                          className="mt-0.5 truncate text-left text-sm text-gray-500"
                        >
                          @homedesign.tamra
                        </p>
                      </div>
                    </div>

                    <div className="mr-4 flex shrink-0 items-center gap-2 text-sm font-medium">
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <rect x="2" y="2" width="20" height="20" rx="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                      </svg>
                      <span className="hidden sm:inline">Instagram</span>
                      <span className="text-gray-400 transition group-hover:-translate-x-1 group-hover:text-black">
                        ←
                      </span>
                    </div>
                  </a>
                </div>

                <p className="mt-6 text-sm leading-6 text-gray-500">
                  אפשר גם להשאיר פרטים ונחזור אליכם בהקדם.
                </p>
              </div>

              {/* CONTACT FORM */}

              <div className="bg-white p-7 sm:p-10 lg:p-12">
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold">השאירו פרטים</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    מלאו כמה פרטים קצרים ונוכל לעזור לכם בצורה מדויקת יותר.
                  </p>
                </div>

                <form
                  className="space-y-5"
                  onSubmit={handleContactSubmit}
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">שם מלא</span>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(event) => setContactName(event.target.value)}
                        placeholder="השם שלכם"
                        autoComplete="name"
                        required
                        disabled={contactLoading}
                        className="w-full rounded-xl border border-gray-200 bg-neutral-50 px-4 py-3.5 outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">טלפון</span>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(event) => setContactPhone(event.target.value)}
                        placeholder="05X-XXXXXXX"
                        autoComplete="tel"
                        inputMode="tel"
                        required
                        disabled={contactLoading}
                        className="w-full rounded-xl border border-gray-200 bg-neutral-50 px-4 py-3.5 outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">
                      במה נוכל לעזור?
                    </span>
                    <select
                      value={contactSubject}
                      onChange={(event) => setContactSubject(event.target.value)}
                      required
                      disabled={contactLoading}
                      className="w-full rounded-xl border border-gray-200 bg-neutral-50 px-4 py-3.5 outline-none transition focus:border-black focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="" disabled>
                        בחרו נושא
                      </option>
                      <option value="product">שאלה על מוצר</option>
                      <option value="custom-sofa">ספה בהתאמה אישית</option>
                      <option value="delivery">משלוח והזמנה</option>
                      <option value="mattress">ייעוץ לבחירת מזרן</option>
                      <option value="other">נושא אחר</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">
                      הודעה
                      <span className="mr-1 font-normal text-gray-400">
                        (לא חובה)
                      </span>
                    </span>
                    <textarea
                      rows={4}
                      value={contactMessage}
                      onChange={(event) => setContactMessage(event.target.value)}
                      placeholder="כתבו לנו בקצרה מה אתם מחפשים..."
                      disabled={contactLoading}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-neutral-50 px-4 py-3.5 outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {contactLoading ? "שולח..." : "שליחת פרטים"}
                    {!contactLoading && <span>←</span>}
                  </button>

                  {contactSuccess && (
                    <div
                      role="status"
                      className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm text-green-800"
                    >
                      {contactSuccess}
                    </div>
                  )}

                  {contactError && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700"
                    >
                      {contactError}
                    </div>
                  )}

                  <p className="text-center text-xs leading-5 text-gray-400">
                    בלחיצה על שליחה הפרטים יועברו לצוות Home Design לצורך יצירת קשר.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="bg-neutral-950 text-white">
        <div
          dir="rtl"
          className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div>
            <h3 className="mb-5 text-2xl font-semibold">
              Home Design
            </h3>

            <p className="text-gray-400">
              ריהוט ועיצוב לבית בסגנון מודרני, נקי ומדויק.
            </p>

            <div
              dir="ltr"
              className="mt-6 flex gap-5"
            >
              {/* INSTAGRAM */}

              <a
                href="https://www.instagram.com/homedesign.tamra?stkn=MXcybWVjaWF3d2NrNQ=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="5"
                  />

                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                  />

                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill="currentColor"
                  />
                </svg>
              </a>
</div>
          </div>

          <div>
            <h4 className="mb-5 font-semibold">
              קטגוריות
            </h4>

            <div className="flex flex-col gap-3 text-gray-400">
              {categoriesLoaded ? (
                footerCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="transition hover:text-white"
                  >
                    {category.name}
                  </Link>
                ))
              ) : (
                <>
                  <Link href="/category/tables">
                    פינות אוכל ושולחנות
                  </Link>

                  <Link href="/category/armchairs">
                    כיסאות וכורסאות
                  </Link>

                  <Link href="/category/decor">
                    עיצוב הבית
                  </Link>

                  <Link href="/category/mattresses">
                    מזרנים
                  </Link>
                </>
              )}

              <Link
                href="/custom-sofas"
                className="transition hover:text-white"
              >
                ספות בהתאמה אישית
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-5 font-semibold">
              שירות לקוחות
            </h4>

            <div className="flex flex-col gap-3 text-gray-400">
              <a href="#contact">
                צור קשר
              </a>

              <Link href="/shipping">
                משלוחים
              </Link>

              <Link href="/returns">
                החזרות והחלפות
              </Link>

              <Link href="/faq">
                שאלות נפוצות
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-5 font-semibold">
              מידע
            </h4>

            <div className="flex flex-col gap-3 text-gray-400">
              <Link href="/about">
                אודות
              </Link>

              <a href="#">
                תקנון האתר
              </a>

              <Link href="/privacy">
                מדיניות פרטיות
              </Link>

              <Link href="/accessibility">
                הצהרת נגישות
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div
            dir="rtl"
            className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-gray-500 md:flex-row"
          >
            <p>
              © 2026 Home Design. כל הזכויות שמורות.
            </p>

            <p>
              עיצוב ופיתוח Home Design
            </p>
          </div>
        </div>
      </footer>

      {/* ================= WHATSAPP ================= */}

      <a
        href="https://wa.me/972505358197"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="שליחת הודעה ב-WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg transition hover:scale-105 hover:bg-neutral-800"
      >
        <MessageCircle size={25} strokeWidth={1.7} />
      </a>
    </main>
  );
}