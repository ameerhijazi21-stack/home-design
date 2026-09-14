import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import CategoryProducts from "./CategoryProducts";
import { getProductsByCategory } from "../../../lib/products";

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    sub?: string;
  }>;
};

type Subcategory = {
  slug: string;
  name: string;
  description: string;
};

type CategoryInfo = {
  name: string;
  description: string;
  seoDescription: string;
  subcategories: Subcategory[];
};

const categories: Record<string, CategoryInfo> = {
  armchairs: {
    name: "כיסאות וכורסאות",
    description:
      "כיסאות וכורסאות שנבחרו לשלב נוחות, פונקציונליות ועיצוב נקי.",
    seoDescription:
      "כיסאות וכורסאות לבית ב-Home Design טמרה – כיסאות אוכל, כיסאות בר וכורסאות במגוון עיצובים.",
    subcategories: [
      {
        slug: "dining-chairs",
        name: "כיסאות אוכל",
        description: "כיסאות אוכל נוחים ומעוצבים לפינת האוכל שלכם.",
      },
      {
        slug: "bar-chairs",
        name: "כיסאות בר",
        description: "כיסאות בר בעיצוב מודרני למטבח ולאזור האירוח.",
      },
      {
        slug: "armchairs",
        name: "כורסאות",
        description: "כורסאות נוחות ומעוצבות להשלמת חלל המגורים.",
      },
    ],
  },

  tables: {
    name: "פינות אוכל ושולחנות",
    description:
      "שולחנות אוכל, שולחנות סלון ופריטים שמשלימים את חלל האירוח.",
    seoDescription:
      "פינות אוכל ושולחנות ב-Home Design טמרה – שולחנות אוכל, שולחנות סלון ושולחנות צד לבית.",
    subcategories: [
      {
        slug: "dining-tables",
        name: "פינות אוכל",
        description: "פינות אוכל ושולחנות אוכל למפגש משפחתי ואירוח.",
      },
      {
        slug: "coffee-tables",
        name: "שולחנות סלון",
        description: "שולחנות סלון שמשלבים עיצוב ושימושיות.",
      },
      {
        slug: "side-tables",
        name: "שולחנות צד",
        description: "שולחנות צד קטנים ומעוצבים להשלמת החלל.",
      },
    ],
  },

  decor: {
    name: "עיצוב לבית",
    description:
      "מראות, תאורה ואקססוריז שמוסיפים את הפרטים הקטנים שעושים את ההבדל.",
    seoDescription:
      "עיצוב לבית ב-Home Design טמרה – מראות, תאורה ואקססוריז לבית במגוון סגנונות.",
    subcategories: [
      {
        slug: "mirrors",
        name: "מראות",
        description: "מראות דקורטיביות שמוסיפות עומק ואופי לחלל.",
      },
      {
        slug: "lighting",
        name: "תאורה",
        description: "פתרונות תאורה דקורטיביים לבית.",
      },
      {
        slug: "accessories",
        name: "אקססוריז",
        description: "אקססוריז ופריטי נוי להשלמת עיצוב הבית.",
      },
    ],
  },

  mattresses: {
    name: "מזרנים",
    description:
      "מזרנים במגוון מידות וסוגים לשינה נוחה והתאמה לצרכים שלכם.",
    seoDescription:
      "מזרנים ב-Home Design טמרה – מזרני יחיד, מיטה וחצי וזוגי במגוון מידות.",
    subcategories: [
      {
        slug: "single",
        name: "מזרן יחיד",
        description: "מזרנים במידת יחיד לשינה נוחה.",
      },
      {
        slug: "one-and-half",
        name: "מיטה וחצי",
        description: "מזרנים למיטה וחצי במגוון אפשרויות.",
      },
      {
        slug: "double",
        name: "מזרן זוגי",
        description: "מזרנים זוגיים במגוון מידות.",
      },
    ],
  },

  storage: {
    name: "מזנונים וקונסולות",
    description:
      "פתרונות אחסון ועיצוב שמשלבים מראה נקי ושימושיות.",
    seoDescription:
      "מזנונים וקונסולות ב-Home Design טמרה – פתרונות אחסון ועיצוב לבית.",
    subcategories: [],
  },
};

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const { sub } = await searchParams;

  const categoryInfo = categories[category];

  if (!categoryInfo) {
    return {
      title: "קטגוריה לא נמצאה",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const activeSubcategory = sub
    ? categoryInfo.subcategories.find((item) => item.slug === sub)
    : undefined;

  const title = activeSubcategory
    ? `${activeSubcategory.name} | ${categoryInfo.name}`
    : categoryInfo.name;

  const description = activeSubcategory
    ? `${activeSubcategory.description} Home Design בטמרה.`
    : categoryInfo.seoDescription;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  const canonicalUrl = activeSubcategory
    ? `${siteUrl}/category/${category}?sub=${encodeURIComponent(
        activeSubcategory.slug
      )}`
    : `${siteUrl}/category/${category}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "he_IL",
      siteName: "Home Design",
      title: `${title} | Home Design`,
      description,
      url: canonicalUrl,
    },
    twitter: {
      card: "summary",
      title: `${title} | Home Design`,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category } = await params;
  const { sub } = await searchParams;

  const categoryInfo = categories[category];

  if (!categoryInfo) {
    notFound();
  }

  const activeSubcategory =
    sub && categoryInfo.subcategories.some((item) => item.slug === sub)
      ? sub
      : undefined;

  const activeSubcategoryInfo = activeSubcategory
    ? categoryInfo.subcategories.find(
        (item) => item.slug === activeSubcategory
      )
    : undefined;

  const products = await getProductsByCategory(
    category,
    activeSubcategory
  );

  const pageTitle =
    activeSubcategoryInfo?.name || categoryInfo.name;

  const pageDescription =
    activeSubcategoryInfo?.description ||
    categoryInfo.description;

  return (
    <main dir="rtl" className="min-h-screen bg-white text-black">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/">
            <img
              src="/images/new logo.png"
              alt="Home Design"
              className="h-12 w-auto object-contain sm:h-16"
            />
          </Link>

          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 text-sm transition hover:text-gray-500 sm:gap-2"
          >
            חזרה לחנות
            <ChevronLeft size={17} />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-3 text-xs text-gray-500 sm:px-6 sm:py-5 sm:text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/" className="transition hover:text-black">
            דף הבית
          </Link>

          <span>/</span>

          {activeSubcategoryInfo ? (
            <>
              <Link
                href={`/category/${category}`}
                className="transition hover:text-black"
              >
                {categoryInfo.name}
              </Link>

              <span>/</span>

              <span className="text-black">
                {activeSubcategoryInfo.name}
              </span>
            </>
          ) : (
            <span className="text-black">
              {categoryInfo.name}
            </span>
          )}
        </div>
      </div>

      <section className="border-y border-gray-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 sm:py-16">
          <p className="mb-2 text-xs font-medium tracking-[0.18em] text-gray-500 sm:mb-3 sm:text-sm">
            HOME DESIGN
          </p>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            {pageTitle}
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:mt-4 sm:text-base sm:leading-7">
            {pageDescription}
          </p>

          {categoryInfo.subcategories.length > 0 && (
            <div className="mt-6 flex gap-2 overflow-x-auto pb-1 sm:mt-8 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
              <Link
                href={`/category/${category}`}
                className={`min-h-10 shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
                  !activeSubcategory
                    ? "border-black bg-black text-white"
                    : "border-gray-300 bg-white hover:border-black"
                }`}
              >
                הכל
              </Link>

              {categoryInfo.subcategories.map((subcategory) => (
                <Link
                  key={subcategory.slug}
                  href={`/category/${category}?sub=${encodeURIComponent(
                    subcategory.slug
                  )}`}
                  className={`min-h-10 shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
                    activeSubcategory === subcategory.slug
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white hover:border-black"
                  }`}
                >
                  {subcategory.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-7 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-neutral-50 px-6 py-16 text-center">
              <h2 className="text-xl font-semibold">
                אין כרגע מוצרים בקטגוריה
              </h2>

              <p className="mt-3 text-gray-500">
                מוצרים חדשים יתווספו בקרוב.
              </p>

              <Link
                href="/"
                className="mt-6 inline-block rounded-xl bg-black px-7 py-3 font-medium text-white transition hover:bg-gray-800"
              >
                חזרה לדף הבית
              </Link>
            </div>
          ) : (
            <CategoryProducts products={products} />
          )}
        </div>
      </section>
    </main>
  );
}
