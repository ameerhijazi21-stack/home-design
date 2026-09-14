import { supabase } from "./supabase";

export type Product = {
  id: number;
  created_at: string;

  name: string;
  slug: string;
  description: string | null;

  category: string;
  subcategory: string | null;

  dimensions: string | null;
  material: string | null;
  finish: string | null;
  care_instructions: string | null;
  delivery_time: string | null;

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

export async function getActiveProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Error loading products:",
      error
    );

    throw new Error(
      "לא ניתן לטעון את המוצרים"
    );
  }

  return (data || []) as Product[];
}

export async function getProductBySlug(
  slug: string
) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error) {
    console.error(
      "Error loading product:",
      error
    );

    return null;
  }

  return data as Product;
}

export async function getProductsByCategory(
  category: string,
  subcategory?: string
) {
  let query = supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .eq("active", true);

  if (subcategory) {
    query = query.eq(
      "subcategory",
      subcategory
    );
  }

  const { data, error } = await query.order(
    "created_at",
    {
      ascending: false,
    }
  );

  if (error) {
    console.error(
      "Error loading category products:",
      error
    );

    throw new Error(
      "לא ניתן לטעון את מוצרי הקטגוריה"
    );
  }

  return (data || []) as Product[];
}

export async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .eq("featured", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Error loading featured products:",
      error
    );

    throw new Error(
      "לא ניתן לטעון מוצרים מומלצים"
    );
  }

  return (data || []) as Product[];
}

export async function getSaleProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .eq("on_sale", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Error loading sale products:",
      error
    );

    throw new Error(
      "לא ניתן לטעון מוצרי מבצע"
    );
  }

  return (data || []) as Product[];
}

export async function getNewProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .eq("is_new", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Error loading new products:",
      error
    );

    throw new Error(
      "לא ניתן לטעון מוצרים חדשים"
    );
  }

  return (data || []) as Product[];
}

/*
  מילון חיפוש בעברית.

  המטרה:
  הלקוח כותב מונחים טבעיים בעברית,
  והמערכת יודעת לקשר אותם לקטגוריות
  ותתי-הקטגוריות שנשמרות ב-Supabase.
*/
const searchAliases: Record<
  string,
  string[]
> = {
  // כיסאות וכורסאות
  כיסא: [
    "armchairs",
    "dining-chairs",
    "bar-chairs",
  ],
  כיסאות: [
    "armchairs",
    "dining-chairs",
    "bar-chairs",
  ],
  "כיסא אוכל": [
    "armchairs",
    "dining-chairs",
  ],
  "כיסאות אוכל": [
    "armchairs",
    "dining-chairs",
  ],
  "כיסא בר": [
    "armchairs",
    "bar-chairs",
  ],
  "כיסאות בר": [
    "armchairs",
    "bar-chairs",
  ],
  כורסה: [
    "armchairs",
  ],
  כורסאות: [
    "armchairs",
  ],

  // שולחנות
  שולחן: [
    "tables",
  ],
  שולחנות: [
    "tables",
  ],
  "שולחן אוכל": [
    "tables",
    "dining-tables",
  ],
  "שולחנות אוכל": [
    "tables",
    "dining-tables",
  ],
  "פינת אוכל": [
    "tables",
    "dining-tables",
  ],
  "פינות אוכל": [
    "tables",
    "dining-tables",
  ],
  "שולחן סלון": [
    "tables",
    "coffee-tables",
  ],
  "שולחנות סלון": [
    "tables",
    "coffee-tables",
  ],
  "שולחן צד": [
    "tables",
    "side-tables",
  ],
  "שולחנות צד": [
    "tables",
    "side-tables",
  ],

  // עיצוב לבית
  עיצוב: [
    "decor",
  ],
  "עיצוב הבית": [
    "decor",
  ],
  "עיצוב לבית": [
    "decor",
  ],
  מראה: [
    "decor",
    "mirrors",
  ],
  מראות: [
    "decor",
    "mirrors",
  ],
  תאורה: [
    "decor",
    "lighting",
  ],
  מנורה: [
    "decor",
    "lighting",
  ],
  מנורות: [
    "decor",
    "lighting",
  ],
  אקססוריז: [
    "decor",
    "accessories",
  ],
  אביזרים: [
    "decor",
    "accessories",
  ],
  אגרטל: [
    "decor",
    "accessories",
  ],
  אגרטלים: [
    "decor",
    "accessories",
  ],
  פסל: [
    "decor",
    "accessories",
  ],
  פסלים: [
    "decor",
    "accessories",
  ],

  // מזרנים
  מזרן: [
    "mattresses",
  ],
  מזרנים: [
    "mattresses",
  ],
  "מזרן יחיד": [
    "mattresses",
    "single",
  ],
  "מזרן זוגי": [
    "mattresses",
    "double",
  ],
  "מיטה וחצי": [
    "mattresses",
    "one-and-half",
  ],

  // אחסון
  אחסון: [
    "storage",
  ],
  מזנון: [
    "storage",
  ],
  מזנונים: [
    "storage",
  ],
  קונסולה: [
    "storage",
  ],
  קונסולות: [
    "storage",
  ],
};

function normalizeSearchText(
  value: string
) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[,%_()]/g, " ")
    .replace(/\s+/g, " ");
}

function getAliasTerms(
  query: string
) {
  const normalized =
    normalizeSearchText(query);

  const terms = new Set<string>();

  terms.add(normalized);

  Object.entries(searchAliases).forEach(
    ([alias, values]) => {
      const normalizedAlias =
        normalizeSearchText(alias);

      if (
        normalized.includes(
          normalizedAlias
        ) ||
        normalizedAlias.includes(
          normalized
        )
      ) {
        values.forEach((value) =>
          terms.add(value)
        );
      }
    }
  );

  return Array.from(terms);
}

export async function searchProducts(
  query: string
) {
  const cleanQuery =
    normalizeSearchText(query);

  if (!cleanQuery) {
    return [];
  }

  const searchTerms =
    getAliasTerms(cleanQuery);

  const filters: string[] = [];

  for (const term of searchTerms) {
    filters.push(
      `name.ilike.%${term}%`,
      `description.ilike.%${term}%`,
      `sku.ilike.%${term}%`,
      `category.ilike.%${term}%`,
      `subcategory.ilike.%${term}%`
    );
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .or(filters.join(","))
    .limit(50);

  if (error) {
    console.error(
      "Error searching products:",
      error
    );

    throw new Error(
      "לא ניתן לבצע חיפוש"
    );
  }

  const products =
    (data || []) as Product[];

  const words = cleanQuery
    .split(" ")
    .filter(Boolean);

  function getSearchScore(
    product: Product
  ) {
    const name =
      product.name?.toLowerCase() || "";

    const description =
      product.description?.toLowerCase() ||
      "";

    const sku =
      product.sku?.toLowerCase() || "";

    const category =
      product.category?.toLowerCase() ||
      "";

    const subcategory =
      product.subcategory?.toLowerCase() ||
      "";

    let score = 0;

    if (name === cleanQuery) {
      score += 100;
    }

    if (
      name.startsWith(cleanQuery)
    ) {
      score += 60;
    }

    if (
      name.includes(cleanQuery)
    ) {
      score += 50;
    }

    if (sku === cleanQuery) {
      score += 90;
    }

    if (
      sku.includes(cleanQuery)
    ) {
      score += 40;
    }

    for (const term of searchTerms) {
      if (
        subcategory === term
      ) {
        score += 45;
      }

      if (
        category === term
      ) {
        score += 35;
      }

      if (
        subcategory.includes(term)
      ) {
        score += 25;
      }

      if (
        category.includes(term)
      ) {
        score += 20;
      }

      if (
        name.includes(term)
      ) {
        score += 20;
      }

      if (
        description.includes(term)
      ) {
        score += 5;
      }
    }

    for (const word of words) {
      if (
        name.includes(word)
      ) {
        score += 10;
      }

      if (
        description.includes(word)
      ) {
        score += 3;
      }
    }

    return score;
  }

  return products
    .sort(
      (a, b) =>
        getSearchScore(b) -
        getSearchScore(a)
    )
    .slice(0, 12);
}

export type ProductVariant = {
  id: number;
  created_at: string;
  product_id: number;

  color: string | null;
  size: string | null;

  price: number | null;
  stock: number;

  sku: string | null;
  active: boolean;
};

export async function getProductVariants(
  productId: number
) {
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .eq("active", true)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error loading product variants:",
      error
    );

    throw new Error(
      "לא ניתן לטעון את אפשרויות המוצר"
    );
  }

  return (data || []) as ProductVariant[];
}