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
  const [contactWebsite, setContactWebsite] = useState("");
  const contactStartedAtRef = useRef(Date.now());

  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState("");
  const [contactError, setContactError] = useState("");

  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

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

    if (fullName.length < 2 || fullName.length > 100) {
      setContactError("נא להזין שם מלא תקין.");
      return;
    }

    if (!/^0\d{8,9}$/.test(phone.replace(/[-\s]/g, ""))) {
      setContactError("נא להזין מספר טלפון תקין.");
      return;
    }

    if (message.length > 1500) {
      setContactError("ההודעה ארוכה מדי. ניתן להזין עד 1,500 תווים.");
      return;
    }

    try {
      setContactLoading(true);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          phone,
          subject,
          message,
          website: contactWebsite,
          startedAt: contactStartedAtRef.current,
        }),
      });

      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !result?.ok) {
        if (response.status === 429) {
          setContactError(
            "נשלחו מספר פניות בזמן קצר. נסו שוב בעוד כמה דקות."
          );
          return;
        }

        setContactError(
          result?.error ||
            "לא הצלחנו לשלוח את הפרטים כרגע. אפשר לנסות שוב או לפנות אלינו ב-WhatsApp."
        );
        return;
      }

      setContactName("");
      setContactPhone("");
      setContactSubject("");
      setContactMessage("");
      setContactWebsite("");
      contactStartedAtRef.current = Date.now();

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

  const categories = [
    {
      name: "פינות אוכל",
      image: siteImages.category_dining,
      href: "/category/tables?sub=dining-tables",
    },
    {
      name: "כיסאות וכורסאות",
      image: siteImages.category_armchairs,
      href: "/category/armchairs",
    },
    {
      name: "שולחנות סלון",
      image: siteImages.category_coffee,
      href: "/category/tables?sub=coffee-tables",
    },
    {
      name: "עיצוב לבית",
      image: siteImages.category_decor,
      href: "/category/decor",
    },
    {
      name: "מזרנים",
      image: siteImages.category_mattresses,
      href: "/category/mattresses",
    },
  ];

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
            className="mx-auto flex h-[58px] max-w-7xl items-center justify-center gap-10 px-6"
          >
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

              <div className="invisible absolute right-1/2 top-full z-50 w-[760px] translate-x-1/2 translate-y-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="grid grid-cols-2 gap-8 border border-gray-200 bg-white p-7 shadow-xl">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                    <Link href="/category/tables?sub=dining-tables" className="group/item">
                      <p className="font-semibold">פינות אוכל</p>
                      <p className="mt-1 text-sm text-gray-500">שולחנות ופינות אוכל</p>
                    </Link>

                    <Link href="/category/armchairs?sub=dining-chairs" className="group/item">
                      <p className="font-semibold">כיסאות</p>
                      <p className="mt-1 text-sm text-gray-500">כיסאות אוכל ובר</p>
                    </Link>

                    <Link href="/category/armchairs?sub=armchairs" className="group/item">
                      <p className="font-semibold">כורסאות</p>
                      <p className="mt-1 text-sm text-gray-500">כורסאות לבית</p>
                    </Link>

                    <Link href="/category/tables?sub=coffee-tables" className="group/item">
                      <p className="font-semibold">שולחנות סלון</p>
                      <p className="mt-1 text-sm text-gray-500">סלון ושולחנות צד</p>
                    </Link>

                    <Link href="/category/storage" className="group/item">
                      <p className="font-semibold">מזנונים וקונסולות</p>
                      <p className="mt-1 text-sm text-gray-500">אחסון ועיצוב</p>
                    </Link>
                  </div>

                  <Link
                    href="/custom-sofas"
                    className="group/card relative min-h-[190px] overflow-hidden"
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
                      <p className="text-lg font-semibold">ספות בהתאמה אישית</p>
                      <p className="mt-1 text-sm">לתכנון הספה שלכם ←</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="/category/mattresses"
              className="group relative flex h-full items-center text-[15px] font-medium"
            >
              מזרנים
              <span className="absolute bottom-0 right-0 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full" />
            </Link>

            <div className="group relative flex h-full items-center">
              <button
                type="button"
                className="flex h-full items-center gap-1 text-[15px] font-medium"
              >
                עיצוב לבית
                <ChevronDown
                  size={15}
                  strokeWidth={1.8}
                  className="transition duration-200 group-hover:rotate-180"
                />
              </button>

              <span className="absolute bottom-0 right-0 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full" />

              <div className="invisible absolute right-1/2 top-full z-50 w-[760px] translate-x-1/2 translate-y-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="grid grid-cols-3 gap-8 border border-gray-200 bg-white p-7 shadow-xl">
                  <div>
                    <h3 className="mb-4 font-semibold">מראות</h3>
                    <div className="flex flex-col gap-3 text-sm text-gray-600">
                      <Link href="/category/decor?sub=mirrors" className="hover:text-black">מראות קיר</Link>
                      <Link href="/category/decor?sub=mirrors" className="hover:text-black">מראות עומדות</Link>
                      <Link href="/category/decor?sub=mirrors" className="hover:text-black">מראות עגולות</Link>
                      <Link href="/category/decor?sub=mirrors" className="hover:text-black">מראות דקורטיביות</Link>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 font-semibold">תאורה</h3>
                    <div className="flex flex-col gap-3 text-sm text-gray-600">
                      <Link href="/category/decor?sub=lighting" className="hover:text-black">מנורות שולחן</Link>
                      <Link href="/category/decor?sub=lighting" className="hover:text-black">מנורות רצפה</Link>
                      <Link href="/category/decor?sub=lighting" className="hover:text-black">תאורת קיר</Link>
                      <Link href="/category/decor?sub=lighting" className="hover:text-black">מנורות תלויות</Link>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 font-semibold">אקססוריז</h3>
                    <div className="flex flex-col gap-3 text-sm text-gray-600">
                      <Link href="/category/decor?sub=accessories" className="hover:text-black">אגרטלים</Link>
                      <Link href="/category/decor?sub=accessories" className="hover:text-black">פסלים</Link>
                      <Link href="/category/decor?sub=accessories" className="hover:text-black">נרות ופמוטים</Link>
                      <Link href="/category/decor?sub=accessories" className="hover:text-black">תמונות וקישוטי קיר</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
              <a href="#categories" onClick={() => setMenuOpen(false)}>
                רהיטים
              </a>

              <Link href="/category/mattresses" onClick={() => setMenuOpen(false)}>
                מזרנים
              </Link>

              <Link href="/category/decor" onClick={() => setMenuOpen(false)}>
                עיצוב לבית
              </Link>

              <Link href="/custom-sofas" onClick={() => setMenuOpen(false)}>
                ספות בהתאמה אישית
              </Link>

              <Link href="/new" onClick={() => setMenuOpen(false)}>
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
                  <div
                    aria-hidden="true"
                    className="absolute -left-[9999px] h-px w-px overflow-hidden"
                  >
                    <label htmlFor="contact-website">
                      אתר
                    </label>
                    <input
                      id="contact-website"
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={contactWebsite}
                      onChange={(event) =>
                        setContactWebsite(event.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">שם מלא</span>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(event) => setContactName(event.target.value)}
                        placeholder="השם שלכם"
                        autoComplete="name"
                        maxLength={100}
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
                        maxLength={20}
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
                      maxLength={1500}
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
              <a href="/category/tables">
                פינות אוכל ושולחנות
              </a>

              <a href="/category/armchairs">
                כיסאות וכורסאות
              </a>

              <a href="/custom-sofas">
                ספות בהתאמה אישית
              </a>

              <a href="/category/decor">
                עיצוב הבית
              </a>

              <a href="/category/mattresses">
                מזרנים
              </a>
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