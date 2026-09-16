import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import CategoryProducts from "./CategoryProducts";
import { getProductsByCategory } from "../../../lib/products";
import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    sub?: string;
  }>;
};

type StoreCategory = {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  sort_order: number;
};

type StoreSubcategory = {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  active: boolean;
  sort_order: number;
};

type CategoryData = {
  category: StoreCategory;
  subcategories: StoreSubcategory[];
};

const categoryDescriptions: Record<string, string> = {
  armchairs:
    "כיסאות וכורסאות שנבחרו לשלב נוחות, פונקציונליות ועיצוב נקי.",
  tables:
    "שולחנות אוכל, שולחנות סלון ופריטים שמשלימים את חלל האירוח.",
  decor:
    "מראות, תאורה ואקססוריז שמוסיפים את הפרטים הקטנים שעושים את ההבדל.",
  mattresses:
    "מזרנים במגוון מידות וסוגים לשינה נוחה והתאמה לצרכים שלכם.",
  storage:
    "פתרונות אחסון ועיצוב שמשלבים מראה נקי ושימושיות.",
};

const subcategoryDescriptions: Record<string, string> = {
  "dining-chairs":
    "כיסאות אוכל נוחים ומעוצבים לפינת האוכל שלכם.",
  "bar-chairs":
    "כיסאות בר בעיצוב מודרני למטבח ולאזור האירוח.",
  armchairs:
    "כורסאות נוחות ומעוצבות להשלמת חלל המגורים.",
  "dining-tables":
    "פינות אוכל ושולחנות אוכל למפגש משפחתי ואירוח.",
  "coffee-tables":
    "שולחנות סלון שמשלבים עיצוב ושימושיות.",
  "side-tables":
    "שולחנות צד קטנים ומעוצבים להשלמת החלל.",
  mirrors:
    "מראות דקורטיביות שמוסיפות עומק ואופי לחלל.",
  lighting:
    "פתרונות תאורה דקורטיביים לבית.",
  accessories:
    "אקססוריז ופריטי נוי להשלמת עיצוב הבית.",
  single:
    "מזרנים במידת יחיד לשינה נוחה.",
  "one-and-half":
    "מזרנים למיטה וחצי במגוון אפשרויות.",
  double:
    "מזרנים זוגיים במגוון מידות.",
};

function getCategoryDescription(
  category: StoreCategory
) {
  return (
    categoryDescriptions[category.slug] ||
    `מבחר ${category.name} לבית בסגנון מודרני, נקי ומדויק.`
  );
}

function getSubcategoryDescription(
  subcategory: StoreSubcategory,
  category: StoreCategory
) {
  return (
    subcategoryDescriptions[subcategory.slug] ||
    `${subcategory.name} מתוך קטגוריית ${category.name}, במבחר עיצובים לבית.`
  );
}

function getSeoDescription(
  category: StoreCategory,
  subcategory?: StoreSubcategory
) {
  if (subcategory) {
    return `${getSubcategoryDescription(
      subcategory,
      category
    )} Home Design בטמרה.`;
  }

  return `${getCategoryDescription(
    category
  )} Home Design בטמרה.`;
}

async function getCategoryData(
  categorySlug: string
): Promise<CategoryData | null> {
  const { data: category, error: categoryError } =
    await supabase
      .from("categories")
      .select(
        "id, name, slug, active, sort_order"
      )
      .eq("slug", categorySlug)
      .eq("active", true)
      .maybeSingle();

  if (categoryError) {
    console.error(
      "Error loading category:",
      categoryError
    );
    return null;
  }

  if (!category) {
    return null;
  }

  const { data: subcategories, error: subcategoriesError } =
    await supabase
      .from("subcategories")
      .select(
        "id, category_id, name, slug, active, sort_order"
      )
      .eq("category_id", category.id)
      .eq("active", true)
      .order("sort_order", {
        ascending: true,
      });

  if (subcategoriesError) {
    console.error(
      "Error loading subcategories:",
      subcategoriesError
    );
  }

  return {
    category: category as StoreCategory,
    subcategories:
      (subcategories || []) as StoreSubcategory[],
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } =
    await params;
  const { sub } = await searchParams;

  const categoryData =
    await getCategoryData(categorySlug);

  if (!categoryData) {
    return {
      title: "קטגוריה לא נמצאה",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { category, subcategories } =
    categoryData;

  const activeSubcategory = sub
    ? subcategories.find(
        (item) => item.slug === sub
      )
    : undefined;

  const title = activeSubcategory
    ? `${activeSubcategory.name} | ${category.name}`
    : category.name;

  const description = getSeoDescription(
    category,
    activeSubcategory
  );

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(
      /\/$/,
      ""
    ) || "http://localhost:3000";

  const canonicalUrl = activeSubcategory
    ? `${siteUrl}/category/${category.slug}?sub=${encodeURIComponent(
        activeSubcategory.slug
      )}`
    : `${siteUrl}/category/${category.slug}`;

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
  const { category: categorySlug } =
    await params;
  const { sub } = await searchParams;

  const categoryData =
    await getCategoryData(categorySlug);

  if (!categoryData) {
    notFound();
  }

  const { category, subcategories } =
    categoryData;

  const activeSubcategory =
    sub &&
    subcategories.some(
      (item) => item.slug === sub
    )
      ? sub
      : undefined;

  const activeSubcategoryInfo =
    activeSubcategory
      ? subcategories.find(
          (item) =>
            item.slug === activeSubcategory
        )
      : undefined;

  const products =
    await getProductsByCategory(
      category.slug,
      activeSubcategory
    );

  const pageTitle =
    activeSubcategoryInfo?.name ||
    category.name;

  const pageDescription =
    activeSubcategoryInfo
      ? getSubcategoryDescription(
          activeSubcategoryInfo,
          category
        )
      : getCategoryDescription(category);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-white text-black"
    >
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
          <Link href="/">
            <img
              src="/images/new-logo.webp"
              alt="Home Design"
              width={220}
              height={90}
              className="h-14 w-auto object-contain sm:h-16"
            />
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm transition hover:text-gray-500"
          >
            חזרה לחנות
            <ChevronLeft size={17} />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-5 text-sm text-gray-500 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="transition hover:text-black"
          >
            דף הבית
          </Link>

          <span>/</span>

          {activeSubcategoryInfo ? (
            <>
              <Link
                href={`/category/${category.slug}`}
                className="transition hover:text-black"
              >
                {category.name}
              </Link>

              <span>/</span>

              <span className="text-black">
                {activeSubcategoryInfo.name}
              </span>
            </>
          ) : (
            <span className="text-black">
              {category.name}
            </span>
          )}
        </div>
      </div>

      <section className="border-y border-gray-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-5 py-12 text-center sm:px-6 sm:py-16">
          <p className="mb-3 text-sm font-medium tracking-[0.18em] text-gray-500">
            HOME DESIGN
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            {pageTitle}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-500">
            {pageDescription}
          </p>

          {subcategories.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <Link
                href={`/category/${category.slug}`}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  !activeSubcategory
                    ? "border-black bg-black text-white"
                    : "border-gray-300 bg-white hover:border-black"
                }`}
              >
                הכל
              </Link>

              {subcategories.map(
                (subcategory) => (
                  <Link
                    key={subcategory.id}
                    href={`/category/${category.slug}?sub=${encodeURIComponent(
                      subcategory.slug
                    )}`}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      activeSubcategory ===
                      subcategory.slug
                        ? "border-black bg-black text-white"
                        : "border-gray-300 bg-white hover:border-black"
                    }`}
                  >
                    {subcategory.name}
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-10 sm:py-14">
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
            <CategoryProducts
              products={products}
            />
          )}
        </div>
      </section>
    </main>
  );
}
