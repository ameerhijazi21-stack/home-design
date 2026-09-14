"use client";

import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { useFavorites } from "../../context/FavoritesContext";

export default function FavoritesPage() {
  const {
    favorites,
    favoritesCount,
    removeFavorite,
    clearFavorites,
  } = useFavorites();

  if (favoritesCount === 0) {
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
              className="shrink-0 text-sm transition hover:text-gray-500"
            >
              חזרה לחנות
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-xl px-5 py-16 text-center sm:py-24">
          <Heart
            size={44}
            strokeWidth={1.3}
            className="mx-auto text-gray-300 sm:h-12 sm:w-12"
          />

          <h1 className="mt-5 text-xl font-semibold sm:mt-6 sm:text-2xl">
            עדיין אין מוצרים במועדפים
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500 sm:text-base">
            לחצו על הלב ליד מוצרים שאהבתם
            והם יישמרו כאן.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-black px-7 py-3.5 font-medium text-white transition hover:bg-gray-800 sm:rounded-none"
          >
            <ShoppingBag size={18} />
            לחנות
          </Link>
        </section>
      </main>
    );
  }

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
            className="shrink-0 text-sm transition hover:text-gray-500"
          >
            חזרה לחנות
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-14">
        <div className="mb-7 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-widest text-gray-500 sm:text-sm">
              HOME DESIGN
            </p>

            <h1 className="mt-2 text-2xl font-semibold sm:text-4xl">
              המועדפים שלי
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {favoritesCount}{" "}
              {favoritesCount === 1
                ? "מוצר שמור"
                : "מוצרים שמורים"}
            </p>
          </div>

          <button
            type="button"
            onClick={clearFavorites}
            className="inline-flex min-h-10 items-center gap-2 self-start rounded-lg px-1 text-sm text-gray-500 transition hover:text-red-600 sm:min-h-0 sm:rounded-none"
          >
            <Trash2 size={16} />
            ניקוי כל המועדפים
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-4 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {favorites.map((product) => {
            const hasOldPrice =
              product.old_price !== null &&
              Number(product.old_price) >
                Number(product.price);

            return (
              <article
                key={product.id}
                className="group bg-white"
              >
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
                        <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-gray-400 sm:text-sm">
                          אין תמונה
                        </div>
                      )}
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      removeFavorite(product.id)
                    }
                    aria-label="הסרה מהמועדפים"
                    title="הסרה מהמועדפים"
                    className="absolute left-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-sm transition hover:bg-red-600 sm:left-3 sm:top-3"
                  >
                    <Heart
                      size={18}
                      fill="currentColor"
                    />
                  </button>

                  {product.is_new && (
                    <span className="absolute right-2 top-2 bg-black px-2.5 py-1.5 text-[11px] font-medium text-white sm:right-3 sm:top-3 sm:px-3 sm:text-xs">
                      חדש
                    </span>
                  )}
                </div>

                <div className="pt-3 sm:pt-4">
                  <p className="mb-1 truncate text-[11px] text-gray-400 sm:text-xs">
                    {product.category}
                  </p>

                  <Link
                    href={`/products/${product.slug}`}
                  >
                    <h2 className="line-clamp-2 text-sm font-medium leading-5 transition hover:text-gray-500 sm:text-base">
                      {product.name}
                    </h2>
                  </Link>

                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 sm:mt-3">
                    <span className="text-base font-semibold sm:text-lg">
                      ₪
                      {Number(
                        product.price
                      ).toLocaleString("he-IL")}
                    </span>

                    {hasOldPrice && (
                      <span className="text-xs text-gray-400 line-through sm:text-sm">
                        ₪
                        {Number(
                          product.old_price
                        ).toLocaleString("he-IL")}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/products/${product.slug}`}
                    className="mt-3 flex min-h-11 w-full items-center justify-center rounded-lg bg-black px-3 py-2.5 text-xs font-medium text-white transition hover:bg-gray-800 sm:mt-4 sm:rounded-none sm:px-4 sm:py-3 sm:text-sm"
                  >
                    לצפייה במוצר
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
