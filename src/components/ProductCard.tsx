"use client";

import Link from "next/link";
import {
  Heart,
  Loader2,
  Settings2,
  ShoppingBag,
} from "lucide-react";
import { useMemo } from "react";

import { Product } from "../lib/products";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useVariantStock } from "../context/VariantStockContext";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  const { addToCart } = useCart();

  const {
    isFavorite,
    toggleFavorite,
  } = useFavorites();

  const {
    loading: variantsLoading,
    getProductVariantsStock,
  } = useVariantStock();

  const variants =
    getProductVariantsStock(product.id);

  const hasVariants =
    variants.length > 0;

  const availableVariantStock = useMemo(
    () =>
      variants.reduce(
        (total, variant) =>
          total + Number(variant.stock),
        0
      ),
    [variants]
  );

  const isInStock = hasVariants
    ? availableVariantStock > 0
    : Number(product.stock) > 0;

  const productIsFavorite =
    isFavorite(product.id);

  const hasOldPrice =
    product.old_price !== null &&
    Number(product.old_price) >
      Number(product.price);

  const discountPercent = hasOldPrice
    ? Math.round(
        ((Number(product.old_price) -
          Number(product.price)) /
          Number(product.old_price)) *
          100
      )
    : 0;

  function handleAddToCart() {
    if (
      variantsLoading ||
      hasVariants ||
      !isInStock
    ) {
      return;
    }

    const productImages =
      product.images &&
      product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [];

    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      image:
        product.image ||
        productImages[0] ||
        null,
      images: productImages,
      sku: product.sku || "",
      variantId: null,
      variantColor: null,
      variantSize: null,
    });
  }

  function handleFavorite() {
    toggleFavorite({
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
    });
  }

  return (
    <article className="group overflow-hidden bg-white">
      <div className="relative overflow-hidden bg-neutral-100">
        <Link
          href={`/products/${product.slug}`}
          className="block"
        >
          <div className="aspect-[4/5] overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                width={800}
                height={1000}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                אין תמונה
              </div>
            )}
          </div>
        </Link>

        <div className="absolute right-3 top-3 flex flex-col items-start gap-2">
          {product.is_new && (
            <span className="bg-black px-3 py-1.5 text-xs font-medium text-white">
              חדש
            </span>
          )}

          {product.on_sale &&
            hasOldPrice && (
              <span className="bg-white px-3 py-1.5 text-xs font-semibold text-black shadow-sm">
                {discountPercent}%-
              </span>
            )}
        </div>

        <button
          type="button"
          onClick={handleFavorite}
          aria-label={
            productIsFavorite
              ? "הסרה מהמועדפים"
              : "הוספה למועדפים"
          }
          aria-pressed={productIsFavorite}
          title={
            productIsFavorite
              ? "הסרה מהמועדפים"
              : "הוספה למועדפים"
          }
          className={`absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition ${
            productIsFavorite
              ? "bg-black text-white"
              : "bg-white text-black hover:bg-black hover:text-white"
          }`}
        >
          <Heart
            size={18}
            fill={
              productIsFavorite
                ? "currentColor"
                : "none"
            }
          />
        </button>

        <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition duration-300 group-hover:translate-y-0">
          {variantsLoading ? (
            <button
              type="button"
              disabled
              className="flex w-full cursor-wait items-center justify-center gap-2 bg-gray-400 px-4 py-3 text-sm font-medium text-white"
            >
              <Loader2
                size={17}
                className="animate-spin"
              />
              טוען...
            </button>
          ) : hasVariants ? (
            <Link
              href={`/products/${product.slug}`}
              className={`flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white transition ${
                isInStock
                  ? "bg-black hover:bg-gray-800"
                  : "pointer-events-none bg-gray-400"
              }`}
            >
              <Settings2 size={17} />

              {isInStock
                ? "לבחירת אפשרויות"
                : "אזל מהמלאי"}
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isInStock}
              className="flex w-full items-center justify-center gap-2 bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <ShoppingBag size={17} />

              {isInStock
                ? "הוספה לסל"
                : "אזל מהמלאי"}
            </button>
          )}
        </div>
      </div>

      <div className="pt-4">
        <p className="mb-1 text-xs text-gray-400">
          {product.category}
        </p>

        <Link
          href={`/products/${product.slug}`}
          className="block"
        >
          <h3 className="text-base font-medium transition hover:text-gray-500">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-lg font-semibold">
            ₪
            {Number(
              product.price
            ).toLocaleString("he-IL")}
          </span>

          {hasOldPrice && (
            <span className="text-sm text-gray-400 line-through">
              ₪
              {Number(
                product.old_price
              ).toLocaleString("he-IL")}
            </span>
          )}
        </div>

        <div className="mt-2">
          {variantsLoading ? (
            <span className="text-xs text-gray-400">
              בודק מלאי...
            </span>
          ) : isInStock ? (
            <span className="text-xs text-green-700">
              במלאי
            </span>
          ) : (
            <span className="text-xs text-red-600">
              אזל מהמלאי
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
