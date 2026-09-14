"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { useCart } from "../../context/CartContext";
import { supabase } from "../../lib/supabase";

type StockMap = Record<string, number>;

function stockKey(productId: number, variantId?: number | null) {
  return `${productId}-${variantId ?? "base"}`;
}

export default function CartPage() {
  const {
    items,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    cartCount,
    cartTotal,
  } = useCart();

  const [stockMap, setStockMap] = useState<StockMap>({});
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStock() {
      if (items.length === 0) {
        setStockMap({});
        setStockLoading(false);
        return;
      }

      try {
        setStockLoading(true);
        setStockError("");

        const next: StockMap = {};

        await Promise.all(
          items.map(async ({ product }) => {
            const variantId = product.variantId ?? null;
            const key = stockKey(product.id, variantId);

            if (variantId !== null) {
              const { data, error } = await supabase
                .from("product_variants")
                .select("stock, active")
                .eq("id", variantId)
                .eq("product_id", product.id)
                .maybeSingle();

              if (error) throw error;
              next[key] = data && data.active ? Number(data.stock) : 0;
            } else {
              const { data, error } = await supabase
                .from("products")
                .select("stock, active")
                .eq("id", product.id)
                .maybeSingle();

              if (error) throw error;
              next[key] = data && data.active ? Number(data.stock) : 0;
            }
          })
        );

        if (!cancelled) setStockMap(next);
      } catch (error) {
        console.error("Error loading cart stock:", error);
        if (!cancelled) {
          setStockError("לא הצלחנו לבדוק את המלאי כרגע. נסה לרענן את העמוד.");
        }
      } finally {
        if (!cancelled) setStockLoading(false);
      }
    }

    loadStock();

    return () => {
      cancelled = true;
    };
  }, [items]);

  const hasInvalidStock = items.some((item) => {
    const available = stockMap[
      stockKey(item.product.id, item.product.variantId ?? null)
    ];

    return (
      !stockLoading &&
      available !== undefined &&
      (available <= 0 || item.quantity > available)
    );
  });

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-50 text-black"
    >
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
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
            המשך בקניות
            <ChevronLeft size={17} />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-14">
        <div className="mb-6 sm:mb-8">
          <p className="text-sm font-medium tracking-widest text-gray-500">
            HOME DESIGN
          </p>

          <h1 className="mt-2 text-2xl font-semibold sm:text-4xl">
            סל הקניות
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {cartCount > 0
              ? `${cartCount} פריטים בסל`
              : "הסל שלך עדיין ריק"}
          </p>
        </div>

        {stockError && items.length > 0 && (
          <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {stockError}
          </div>
        )}

        {items.length === 0 ? (
          <div className="border border-gray-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <ShoppingBag
                size={28}
                strokeWidth={1.5}
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              סל הקניות ריק
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              עדיין לא הוספת מוצרים לסל.
              חזור לחנות ובחר את הפריטים שמתאימים לבית שלך.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex bg-black px-7 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              חזרה לחנות
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
            <div className="space-y-4">
              {items.map((item) => {
                const {
                  product,
                  quantity,
                } = item;

                const image =
                  product.image ||
                  product.images?.[0] ||
                  "";

                const lineTotal =
                  Number(product.price) *
                  quantity;

                const variantKey =
                  product.variantId ??
                  "base";

                const availableStock =
                  stockMap[
                    stockKey(
                      product.id,
                      product.variantId ?? null
                    )
                  ];

                const outOfStock =
                  !stockLoading &&
                  availableStock !== undefined &&
                  availableStock <= 0;

                const quantityTooHigh =
                  !stockLoading &&
                  availableStock !== undefined &&
                  quantity > availableStock;

                const atMaximum =
                  !stockLoading &&
                  availableStock !== undefined &&
                  quantity >= availableStock;

                return (
                  <article
                    key={`${product.id}-${variantKey}`}
                    className="rounded-xl border border-gray-200 bg-white p-3 sm:rounded-none sm:p-5"
                  >
                    <div className="flex gap-3 sm:gap-5">
                      <Link
                        href={`/products/${product.slug}`}
                        className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:h-36 sm:w-36 sm:rounded-none"
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={product.name}
                            width={288}
                            height={288}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            אין תמונה
                          </div>
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link
                              href={`/products/${product.slug}`}
                              className="line-clamp-2 text-sm font-semibold leading-5 transition hover:text-gray-600 sm:text-lg sm:leading-normal"
                            >
                              {product.name}
                            </Link>

                            {(product.variantColor ||
                              product.variantSize) && (
                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                {product.variantColor && (
                                  <span>
                                    צבע:{" "}
                                    <strong className="font-medium text-gray-700">
                                      {product.variantColor}
                                    </strong>
                                  </span>
                                )}

                                {product.variantSize && (
                                  <span>
                                    מידה:{" "}
                                    <strong className="font-medium text-gray-700">
                                      {product.variantSize}
                                    </strong>
                                  </span>
                                )}
                              </div>
                            )}

                            {product.sku && (
                              <p className="mt-2 text-xs text-gray-400">
                                מק״ט: {product.sku}
                              </p>
                            )}

                            <div className="mt-1.5 text-xs sm:mt-2">
                              {stockLoading ? (
                                <span className="inline-flex items-center gap-1.5 text-gray-400">
                                  <Loader2 size={13} className="animate-spin" />
                                  בודק מלאי...
                                </span>
                              ) : outOfStock ? (
                                <span className="font-medium text-red-600">
                                  אזל מהמלאי
                                </span>
                              ) : availableStock !== undefined ? (
                                <span
                                  className={
                                    availableStock <= 3
                                      ? "font-medium text-orange-600"
                                      : "text-green-700"
                                  }
                                >
                                  נשארו {availableStock} במלאי
                                </span>
                              ) : null}
                            </div>

                            {quantityTooHigh && (
                              <p className="mt-2 text-xs font-medium text-red-600">
                                הכמות בסל גבוהה מהמלאי הזמין. הפחת את הכמות ל־
                                {availableStock}.
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            aria-label={`הסרת ${product.name} מהסל`}
                            onClick={() =>
                              removeFromCart(
                                product.id,
                                product.variantId ??
                                  null
                              )
                            }
                            className="shrink-0 p-2 text-gray-400 transition hover:text-red-600"
                          >
                            <Trash2 size={19} />
                          </button>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-3 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-4">
                          <div className="flex w-fit items-center overflow-hidden rounded-lg border border-gray-300 sm:rounded-none">
                            <button
                              type="button"
                              aria-label="הפחתת כמות"
                              onClick={() =>
                                decreaseQuantity(
                                  product.id,
                                  product.variantId ??
                                    null
                                )
                              }
                              className="flex h-11 w-11 items-center justify-center transition hover:bg-neutral-100 sm:h-10 sm:w-10"
                            >
                              <Minus size={16} />
                            </button>

                            <span className="flex h-11 min-w-11 items-center justify-center border-x border-gray-300 px-2 text-sm font-medium sm:h-10 sm:min-w-12 sm:px-3">
                              {quantity}
                            </span>

                            <button
                              type="button"
                              aria-label="הגדלת כמות"
                              disabled={
                                stockLoading ||
                                outOfStock ||
                                atMaximum
                              }
                              onClick={() =>
                                increaseQuantity(
                                  product.id,
                                  product.variantId ??
                                    null
                                )
                              }
                              className="flex h-11 w-11 items-center justify-center transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-gray-300 sm:h-10 sm:w-10"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <div className="text-right sm:text-left">
                            <p className="text-xs text-gray-400">
                              ₪
                              {Number(
                                product.price
                              ).toLocaleString(
                                "he-IL"
                              )}{" "}
                              ליחידה
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                              ₪
                              {lineTotal.toLocaleString(
                                "he-IL"
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="rounded-xl border border-gray-200 bg-white p-4 sm:rounded-none sm:p-6 lg:sticky lg:top-6">
              <h2 className="text-xl font-semibold">
                סיכום הזמנה
              </h2>

              <div className="mt-6 space-y-4 border-b border-gray-200 pb-5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">
                    מספר פריטים
                  </span>

                  <span>{cartCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">
                    סכום ביניים
                  </span>

                  <span>
                    ₪
                    {cartTotal.toLocaleString(
                      "he-IL"
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">
                    משלוח
                  </span>

                  <span>
                    יחושב בקופה
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-5">
                <span className="font-semibold">
                  סה״כ לפני משלוח
                </span>

                <span className="text-2xl font-semibold">
                  ₪
                  {cartTotal.toLocaleString(
                    "he-IL"
                  )}
                </span>
              </div>

              {hasInvalidStock && (
                <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  יש בסל מוצר שכמותו גבוהה מהמלאי הזמין.
                  יש לעדכן את הכמות לפני המעבר לתשלום.
                </div>
              )}

              {stockLoading ? (
                <button
                  type="button"
                  disabled
                  className="flex min-h-14 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-400 px-6 py-4 font-medium text-white sm:rounded-none"
                >
                  <Loader2 size={18} className="animate-spin" />
                  בודק מלאי...
                </button>
              ) : hasInvalidStock || Boolean(stockError) ? (
                <button
                  type="button"
                  disabled
                  className="flex min-h-14 w-full cursor-not-allowed items-center justify-center rounded-xl bg-gray-400 px-6 py-4 font-medium text-white sm:rounded-none"
                >
                  עדכן את הסל לפני התשלום
                </button>
              ) : (
                <Link
                  href="/checkout"
                  className="flex min-h-14 w-full items-center justify-center rounded-xl bg-black px-6 py-4 font-medium text-white transition hover:bg-gray-800 sm:rounded-none"
                >
                  מעבר לתשלום
                </Link>
              )}

              <Link
                href="/"
                className="mt-3 flex min-h-12 w-full items-center justify-center rounded-xl border border-gray-300 px-6 py-3.5 text-sm font-medium transition hover:border-black sm:rounded-none"
              >
                המשך בקניות
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
