import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  ChevronLeft,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Truck,
} from "lucide-react";

import CartHeaderButton from "../../../components/CartHeaderButton";
import ProductPurchasePanel from "../../../components/ProductPurchasePanel";
import ProductGallery from "../../../components/ProductGallery";
import FavoriteButton from "../../../components/FavoriteButton";

import {
  getProductBySlug,
  getProductVariants,
} from "../../../lib/products";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const categoryNames: Record<string, string> = {
  armchairs: "כיסאות וכורסאות",
  tables: "פינות אוכל ושולחנות",
  decor: "עיצוב לבית",
  mattresses: "מזרנים",
  storage: "מזנונים וקונסולות",
};

const subcategoryNames: Record<string, string> = {
  "dining-chairs": "כיסאות אוכל",
  "bar-chairs": "כיסאות בר",
  armchairs: "כורסאות",
  "dining-tables": "פינות אוכל",
  "coffee-tables": "שולחנות סלון",
  "side-tables": "שולחנות צד",
  mirrors: "מראות",
  lighting: "תאורה",
  accessories: "אקססוריז",
  single: "מזרן יחיד",
  "one-and-half": "מזרן מיטה וחצי",
  double: "מזרן זוגי",
};


export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProductBySlug(
    decodeURIComponent(slug)
  );

  if (!product) {
    return {
      title: "המוצר לא נמצא",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const categoryLabel =
    categoryNames[product.category] || product.category;

  const subcategoryLabel = product.subcategory
    ? subcategoryNames[product.subcategory] || product.subcategory
    : categoryLabel;

  const rawDescription =
    product.description?.trim() ||
    `${product.name} מבית Home Design בטמרה. ${subcategoryLabel}, ריהוט ועיצוב לבית.`;

  const description =
    rawDescription.length > 155
      ? `${rawDescription.slice(0, 152).trim()}...`
      : rawDescription;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  const productUrl = `${siteUrl}/products/${encodeURIComponent(product.slug)}`;

  const image =
    product.images && product.images.length > 0
      ? product.images[0]
      : product.image;

  const openGraphImages = image
    ? [
        {
          url: image.startsWith("http")
            ? image
            : `${siteUrl}${image.startsWith("/") ? "" : "/"}${image}`,
          alt: product.name,
        },
      ]
    : undefined;

  return {
    title: product.name,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      type: "website",
      locale: "he_IL",
      siteName: "Home Design",
      title: `${product.name} | Home Design`,
      description,
      url: productUrl,
      images: openGraphImages,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Home Design`,
      description,
      images: openGraphImages?.map((item) => item.url),
    },
    robots: {
      index: product.active,
      follow: product.active,
    },
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const product = await getProductBySlug(
    decodeURIComponent(slug)
  );

  if (!product) {
    notFound();
  }

  const variants = await getProductVariants(product.id);
  const activeVariants = variants.filter((variant) => variant.active);
  const hasVariants = activeVariants.length > 0;
  const variantsInStock = activeVariants.some((variant) => variant.stock > 0);

  const discount =
    product.old_price &&
    Number(product.old_price) > Number(product.price)
      ? Math.round(
          ((Number(product.old_price) - Number(product.price)) /
            Number(product.old_price)) *
            100
        )
      : null;

  const categoryLabel =
    categoryNames[product.category] || product.category;

  const subcategoryLabel = product.subcategory
    ? subcategoryNames[product.subcategory] || product.subcategory
    : null;

  const categoryHref = `/category/${product.category}`;
  const subcategoryHref = product.subcategory
    ? `${categoryHref}?sub=${encodeURIComponent(product.subcategory)}`
    : categoryHref;

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  const whatsappMessage = encodeURIComponent(
    `שלום Home Design, אשמח לקבל פרטים נוספים על המוצר: ${product.name}`
  );

  const whatsappHref =
    `https://wa.me/972505358197?text=${whatsappMessage}`;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  const productUrl =
    `${siteUrl}/products/${encodeURIComponent(product.slug)}`;

  const structuredDataImage =
    productImages.length > 0
      ? productImages.map((image) =>
          image.startsWith("http")
            ? image
            : `${siteUrl}${image.startsWith("/") ? "" : "/"}${image}`
        )
      : undefined;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description?.trim() ||
      `${product.name} מבית Home Design`,
    sku: product.sku || undefined,
    image: structuredDataImage,
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: "Home Design",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "ILS",
      price: Number(product.price).toFixed(2),
      availability:
        hasVariants
          ? variantsInStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock"
          : product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <main dir="rtl" className="min-h-screen bg-white text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-6">
          <Link href="/">
            <img
              src="/images/new logo.png"
              alt="Home Design"
              className="h-14 w-auto object-contain sm:h-16"
            />
          </Link>

          <div className="flex items-center gap-3">
            <CartHeaderButton />

            <Link
              href="/"
              className="hidden items-center gap-2 text-sm transition hover:text-gray-500 sm:flex"
            >
              חזרה לחנות
              <ChevronLeft size={17} />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-3 text-xs text-gray-500 sm:px-6 sm:py-5 sm:text-sm">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link href="/" className="transition hover:text-black">
            דף הבית
          </Link>

          <span>/</span>

          <Link
            href={categoryHref}
            className="transition hover:text-black"
          >
            {categoryLabel}
          </Link>

          {subcategoryLabel && (
            <>
              <span>/</span>
              <Link
                href={subcategoryHref}
                className="transition hover:text-black"
              >
                {subcategoryLabel}
              </Link>
            </>
          )}

          <span>/</span>
          <span className="text-black">{product.name}</span>
        </div>
      </div>

      <section className="pb-12 pt-1 sm:pb-20 sm:pt-4">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 sm:gap-10 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div>
            <ProductGallery
              name={product.name}
              image={product.image}
              images={productImages}
            />
          </div>

          <div className="pt-0 lg:pt-3">
            <div className="mb-4 flex flex-wrap gap-2">
              {product.is_new && (
                <span className="bg-black px-3 py-1.5 text-xs font-semibold text-white">
                  חדש
                </span>
              )}

              {product.on_sale && discount && (
                <span className="bg-red-600 px-3 py-1.5 text-xs font-semibold text-white">
                  {discount}% הנחה
                </span>
              )}
            </div>

            <p className="mb-3 text-sm text-gray-500">
              {subcategoryLabel || categoryLabel}
            </p>

            <h1 className="text-2xl font-semibold leading-tight sm:text-4xl">
              {product.name}
            </h1>

            {product.sku && (
              <p className="mt-3 text-sm text-gray-400">
                מק״ט: {product.sku}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-end gap-3 sm:mt-7">
              <span className="text-2xl font-semibold sm:text-3xl">
                ₪{Number(product.price).toLocaleString("he-IL")}
              </span>

              {product.old_price &&
                Number(product.old_price) > Number(product.price) && (
                  <span className="pb-1 text-lg text-gray-400 line-through">
                    ₪{Number(product.old_price).toLocaleString("he-IL")}
                  </span>
                )}
            </div>

            {hasVariants && (
              <p className="mt-2 text-xs text-gray-400">
                המחיר עשוי להשתנות בהתאם לאפשרות שתבחרו.
              </p>
            )}

            {product.description && (
              <p className="mt-7 whitespace-pre-line leading-8 text-gray-600">
                {product.description}
              </p>
            )}

            {(product.dimensions ||
              product.material ||
              product.finish ||
              product.delivery_time ||
              product.care_instructions) && (
              <div className="mt-8 border border-gray-200 bg-neutral-50 p-5 sm:p-6">
                <h2 className="text-lg font-semibold">פרטי המוצר</h2>

                <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {product.dimensions && (
                    <div className="border-b border-gray-200 pb-3">
                      <p className="text-xs font-medium text-gray-500">
                        מידות
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {product.dimensions}
                      </p>
                    </div>
                  )}

                  {product.material && (
                    <div className="border-b border-gray-200 pb-3">
                      <p className="text-xs font-medium text-gray-500">
                        חומר
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {product.material}
                      </p>
                    </div>
                  )}

                  {product.finish && (
                    <div className="border-b border-gray-200 pb-3">
                      <p className="text-xs font-medium text-gray-500">
                        גימור / צבע
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {product.finish}
                      </p>
                    </div>
                  )}

                  {product.delivery_time && (
                    <div className="border-b border-gray-200 pb-3">
                      <p className="text-xs font-medium text-gray-500">
                        זמן אספקה
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {product.delivery_time}
                      </p>
                    </div>
                  )}

                  {product.care_instructions && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium text-gray-500">
                        הוראות תחזוקה
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm leading-6">
                        {product.care_instructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-7 border-y border-gray-200 py-5">
              {hasVariants ? (
                variantsInStock ? (
                  <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                    <BadgeCheck size={18} />
                    זמין במלאי — בחרו אפשרות לצפייה בזמינות המדויקת
                  </div>
                ) : (
                  <p className="text-sm font-medium text-red-600">
                    כל אפשרויות המוצר אזלו כרגע מהמלאי
                  </p>
                )
              ) : product.stock > 0 ? (
                <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                  <BadgeCheck size={18} />
                  במלאי — {product.stock} יחידות
                </div>
              ) : (
                <p className="text-sm font-medium text-red-600">
                  המוצר אינו זמין כרגע במלאי
                </p>
              )}
            </div>

            <ProductPurchasePanel
              product={product}
              variants={variants}
            />

            <div className="mt-5">
              <FavoriteButton
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: Number(product.price),
                  old_price:
                    product.old_price !== null
                      ? Number(product.old_price)
                      : null,
                  image: product.image,
                  category: product.category,
                  subcategory: product.subcategory,
                  stock: Number(product.stock),
                  on_sale: product.on_sale,
                  is_new: product.is_new,
                }}
              />
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-black bg-black px-5 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                <MessageCircle size={19} />
                שאלה על המוצר ב-WhatsApp
              </a>

              <a
                href="https://waze.com/ul/hsvc4bt30t"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-gray-300 px-5 py-3.5 text-sm font-medium transition hover:border-black"
              >
                <MapPin size={19} />
                ניווט ל-Home Design
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="flex items-start gap-3 border border-gray-200 p-4">
                <Truck
                  size={22}
                  strokeWidth={1.6}
                  className="mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold">משלוחים</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    משלוח או איסוף עצמי בהתאם להזמנה.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border border-gray-200 p-4">
                <ShieldCheck
                  size={22}
                  strokeWidth={1.6}
                  className="mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold">קנייה בטוחה</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    פרטי ההזמנה נשמרים בצורה מסודרת.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border border-gray-200 p-4">
                <MessageCircle
                  size={22}
                  strokeWidth={1.6}
                  className="mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold">שירות אישי</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    ניתן ליצור קשר לקבלת פרטים נוספים.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
