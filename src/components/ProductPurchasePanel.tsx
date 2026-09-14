"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ShoppingBag,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import type {
  Product,
  ProductVariant,
} from "../lib/products";

type ProductPurchasePanelProps = {
  product: Product;
  variants: ProductVariant[];
};

export default function ProductPurchasePanel({
  product,
  variants,
}: ProductPurchasePanelProps) {
  const { addToCart } = useCart();

  const activeVariants = useMemo(
    () =>
      variants.filter(
        (variant) => variant.active
      ),
    [variants]
  );

  const colors = useMemo(
    () =>
      Array.from(
        new Set(
          activeVariants
            .map(
              (variant) =>
                variant.color
            )
            .filter(
              (value): value is string =>
                Boolean(value)
            )
        )
      ),
    [activeVariants]
  );

  const sizes = useMemo(
    () =>
      Array.from(
        new Set(
          activeVariants
            .map(
              (variant) =>
                variant.size
            )
            .filter(
              (value): value is string =>
                Boolean(value)
            )
        )
      ),
    [activeVariants]
  );

  const [selectedColor, setSelectedColor] =
    useState<string>("");
  const [selectedSize, setSelectedSize] =
    useState<string>("");
  const [message, setMessage] =
    useState("");

  const selectedVariant =
    useMemo(() => {
      if (
        activeVariants.length === 0
      ) {
        return null;
      }

      return (
        activeVariants.find(
          (variant) =>
            (!variant.color ||
              variant.color ===
                selectedColor) &&
            (!variant.size ||
              variant.size ===
                selectedSize)
        ) || null
      );
    }, [
      activeVariants,
      selectedColor,
      selectedSize,
    ]);

  const requiresColor =
    colors.length > 0;
  const requiresSize =
    sizes.length > 0;

  const selectionComplete =
    (!requiresColor ||
      Boolean(selectedColor)) &&
    (!requiresSize ||
      Boolean(selectedSize));

  const currentPrice =
    selectedVariant?.price !== null &&
    selectedVariant?.price !== undefined
      ? Number(
          selectedVariant.price
        )
      : Number(product.price);

  const currentStock =
    activeVariants.length > 0
      ? selectedVariant?.stock ?? 0
      : product.stock;

  function chooseColor(color: string) {
    setMessage("");

    if (selectedColor === color) {
      setSelectedColor("");
      return;
    }

    setSelectedColor(color);

    if (selectedSize) {
      const exists = activeVariants.some(
        (variant) =>
          variant.color === color &&
          (!variant.size ||
            variant.size ===
              selectedSize)
      );

      if (!exists) {
        setSelectedSize("");
      }
    }
  }

  function chooseSize(size: string) {
    setMessage("");

    if (selectedSize === size) {
      setSelectedSize("");
      return;
    }

    setSelectedSize(size);

    if (selectedColor) {
      const exists = activeVariants.some(
        (variant) =>
          variant.size === size &&
          (!variant.color ||
            variant.color ===
              selectedColor)
      );

      if (!exists) {
        setSelectedColor("");
      }
    }
  }

  function handleAddToCart() {
    setMessage("");

    if (
      activeVariants.length > 0 &&
      !selectionComplete
    ) {
      setMessage(
        "יש לבחור את אפשרויות המוצר לפני ההוספה לסל."
      );
      return;
    }

    if (
      activeVariants.length > 0 &&
      !selectedVariant
    ) {
      setMessage(
        "השילוב שבחרת אינו זמין."
      );
      return;
    }

    if (currentStock <= 0) {
      setMessage(
        "האפשרות שבחרת אזלה מהמלאי."
      );
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
      price: currentPrice,
      image:
        product.image ||
        productImages[0] ||
        null,
      images: productImages,
      sku:
        selectedVariant?.sku ||
        product.sku ||
        "",
      variantId:
        selectedVariant?.id ??
        null,
      variantColor:
        selectedVariant?.color ??
        null,
      variantSize:
        selectedVariant?.size ??
        null,
    });

    setMessage(
      "המוצר נוסף לסל."
    );
  }

  return (
    <div className="mt-5 sm:mt-7">
      {colors.length > 0 && (
        <div className="mb-5 sm:mb-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-medium">
              צבע
            </p>

            {selectedColor && (
              <span className="text-sm text-gray-500">
                {selectedColor}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const available =
                activeVariants.some(
                  (variant) =>
                    variant.color ===
                      color &&
                    (!selectedSize ||
                      !variant.size ||
                      variant.size ===
                        selectedSize) &&
                    variant.stock > 0
                );

              const selected =
                selectedColor ===
                color;

              return (
                <button
                  key={color}
                  type="button"
                  disabled={!available}
                  onClick={() =>
                    chooseColor(color)
                  }
                  className={`relative min-h-11 min-w-20 rounded-lg border px-4 py-3 text-sm transition ${
                    selected
                      ? "border-black bg-black text-white"
                      : available
                        ? "border-gray-300 bg-white hover:border-black"
                        : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                  }`}
                >
                  {selected && (
                    <Check
                      size={14}
                      className="ml-1 inline"
                    />
                  )}
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="mb-5 sm:mb-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-medium">
              מידה
            </p>

            {selectedSize && (
              <span className="text-sm text-gray-500">
                {selectedSize}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const available =
                activeVariants.some(
                  (variant) =>
                    variant.size ===
                      size &&
                    (!selectedColor ||
                      !variant.color ||
                      variant.color ===
                        selectedColor) &&
                    variant.stock > 0
                );

              const selected =
                selectedSize === size;

              return (
                <button
                  key={size}
                  type="button"
                  disabled={!available}
                  onClick={() =>
                    chooseSize(size)
                  }
                  className={`min-h-11 min-w-24 rounded-lg border px-4 py-3 text-sm transition ${
                    selected
                      ? "border-black bg-black text-white"
                      : available
                        ? "border-gray-300 bg-white hover:border-black"
                        : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeVariants.length > 0 && !selectionComplete && (
        <p className="mb-5 text-sm text-gray-500">
          בחרו את אפשרויות המוצר כדי לראות מחיר וזמינות מדויקים.
        </p>
      )}

      {activeVariants.length > 0 &&
        selectionComplete &&
        selectedVariant && (
          <div className="mb-5 rounded-xl border border-gray-200 bg-neutral-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">
                  מחיר האפשרות שנבחרה
                </p>

                <p className="mt-1 text-xl font-semibold">
                  ₪
                  {currentPrice.toLocaleString(
                    "he-IL"
                  )}
                </p>
              </div>

              <div className="text-sm">
                {currentStock > 0 ? (
                  <span className="font-medium text-green-700">
                    במלאי —{" "}
                    {currentStock} יחידות
                  </span>
                ) : (
                  <span className="font-medium text-red-600">
                    אזל מהמלאי
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

      {message && (
        <p
          className={`mb-3 text-sm ${
            message ===
            "המוצר נוסף לסל."
              ? "text-green-700"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={
          activeVariants.length === 0
            ? product.stock <= 0
            : selectionComplete &&
                selectedVariant
              ? selectedVariant.stock <=
                0
              : false
        }
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 text-base font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        <ShoppingBag size={19} />

        {activeVariants.length > 0 &&
        !selectionComplete
          ? "בחר אפשרויות והוסף לסל"
          : currentStock <= 0
            ? "אזל מהמלאי"
            : "הוספה לסל"}
      </button>
    </div>
  );
}
