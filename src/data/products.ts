export type Product = {
  id: number;
  slug: string;

  name: string;
  category: string;
  subcategory?: string;

  price: number;
  oldPrice?: number;

  images: string[];

  shortDescription: string;
  description: string;

  sku?: string;

  colors?: string[];
  sizes?: string[];

  inStock: boolean;
  stock?: number;

  isNew?: boolean;
  isSale?: boolean;
  featured?: boolean;
};

export const products: Product[] = [
  {
    id: 1,

    slug: "example-sofa",

    name: "ספה מודרנית לדוגמה",

    category: "sofas",

    subcategory: "three-seat",

    price: 3990,

    oldPrice: 4490,

    images: ["/images/categories/sofas.png"],

    shortDescription: "ספה מודרנית בעיצוב נקי ונוח.",

    description:
      "ספה מודרנית בעיצוב אלגנטי המתאימה לסלון מודרני. המוצר שמופיע כרגע הוא מוצר לדוגמה בלבד.",

    sku: "HD-001",

    colors: ["בז׳", "אפור", "שחור"],

    sizes: ["220 ס״מ", "240 ס״מ"],

    inStock: true,

    stock: 5,

    isNew: true,

    isSale: true,

    featured: true,
  },

  {
    id: 2,

    slug: "example-armchair",

    name: "כורסה לדוגמה",

    category: "armchairs",

    price: 1490,

    images: ["/images/categories/armchairs.png"],

    shortDescription: "כורסה מודרנית ונוחה לבית.",

    description:
      "כורסה בעיצוב מודרני המתאימה לסלון, חדר שינה או פינת קריאה.",

    sku: "HD-002",

    colors: ["שמנת", "אפור"],

    inStock: true,

    stock: 3,

    isNew: true,

    featured: true,
  },

  {
    id: 3,

    slug: "example-table",

    name: "שולחן לדוגמה",

    category: "tables",

    price: 2290,

    images: ["/images/categories/tables.png"],

    shortDescription: "שולחן מודרני בעיצוב אלגנטי.",

    description:
      "שולחן מודרני המתאים לחללים מעוצבים בסגנון נקי ועכשווי.",

    sku: "HD-003",

    inStock: true,

    stock: 4,

    featured: true,
  },

  {
    id: 4,

    slug: "example-mattress",

    name: "מזרן זוגי לדוגמה",

    category: "mattresses",

    price: 1990,

    oldPrice: 2390,

    images: ["/images/categories/mattresses.png"],

    shortDescription: "מזרן זוגי איכותי ונוח.",

    description:
      "מזרן זוגי המעניק תמיכה ונוחות לשינה. פרטי המוצר כרגע משמשים כדוגמה.",

    sku: "HD-004",

    sizes: [
      "140×190",
      "140×200",
      "160×190",
      "160×200",
      "180×200",
    ],

    inStock: true,

    stock: 8,

    isSale: true,

    featured: true,
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(category: string) {
  return products.filter((product) => product.category === category);
}

export function getFeaturedProducts() {
  return products.filter((product) => product.featured);
}

export function getSaleProducts() {
  return products.filter((product) => product.isSale);
}

export function getNewProducts() {
  return products.filter((product) => product.isNew);
}