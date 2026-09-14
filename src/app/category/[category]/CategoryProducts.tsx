"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ChevronDown,
  SlidersHorizontal,
  X,
} from "lucide-react";

import ProductCard from "../../../components/ProductCard";
import type { Product } from "../../../lib/products";

type CategoryProductsProps = {
  products: Product[];
};

type SortOption =
  | "newest"
  | "price-low"
  | "price-high"
  | "name";

const PRODUCTS_PER_PAGE = 12;

export default function CategoryProducts({
  products,
}: CategoryProductsProps) {
  const [sortBy, setSortBy] =
    useState<SortOption>("newest");

  const [showFilters, setShowFilters] =
    useState(false);

  const [onlyInStock, setOnlyInStock] =
    useState(false);

  const [onlySale, setOnlySale] =
    useState(false);

  const [onlyNew, setOnlyNew] =
    useState(false);

  const [visibleCount, setVisibleCount] =
    useState(PRODUCTS_PER_PAGE);

  const filteredAndSortedProducts =
    useMemo(() => {
      let result = [...products];

      if (onlyInStock) {
        result = result.filter(
          (product) =>
            Number(product.stock) > 0
        );
      }

      if (onlySale) {
        result = result.filter(
          (product) => product.on_sale
        );
      }

      if (onlyNew) {
        result = result.filter(
          (product) => product.is_new
        );
      }

      switch (sortBy) {
        case "price-low":
          result.sort(
            (a, b) =>
              Number(a.price) -
              Number(b.price)
          );
          break;

        case "price-high":
          result.sort(
            (a, b) =>
              Number(b.price) -
              Number(a.price)
          );
          break;

        case "name":
          result.sort((a, b) =>
            a.name.localeCompare(
              b.name,
              "he"
            )
          );
          break;

        default:
          result.sort(
            (a, b) =>
              new Date(
                b.created_at
              ).getTime() -
              new Date(
                a.created_at
              ).getTime()
          );
      }

      return result;
    }, [
      products,
      onlyInStock,
      onlySale,
      onlyNew,
      sortBy,
    ]);

  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [
    products,
    onlyInStock,
    onlySale,
    onlyNew,
    sortBy,
  ]);

  const displayedProducts =
    useMemo(
      () =>
        filteredAndSortedProducts.slice(
          0,
          visibleCount
        ),
      [
        filteredAndSortedProducts,
        visibleCount,
      ]
    );

  const activeFiltersCount =
    Number(onlyInStock) +
    Number(onlySale) +
    Number(onlyNew);

  const hasMoreProducts =
    visibleCount <
    filteredAndSortedProducts.length;

  function clearFilters() {
    setOnlyInStock(false);
    setOnlySale(false);
    setOnlyNew(false);
  }

  function loadMore() {
    setVisibleCount((current) =>
      Math.min(
        current + PRODUCTS_PER_PAGE,
        filteredAndSortedProducts.length
      )
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:pb-5">
        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">
            כל המוצרים
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            מציגים{" "}
            {Math.min(
              displayedProducts.length,
              filteredAndSortedProducts.length
            )}{" "}
            מתוך{" "}
            {filteredAndSortedProducts.length}{" "}
            מוצרים
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={() =>
              setShowFilters(
                (current) => !current
              )
            }
            className="relative flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium transition hover:border-black sm:w-auto sm:px-4"
          >
            <SlidersHorizontal
              size={17}
              strokeWidth={1.7}
            />

            סינון

            {activeFiltersCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[11px] text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target
                  .value as SortOption
              )
            }
            className="h-11 w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-black sm:w-auto sm:px-4"
            aria-label="מיון מוצרים"
          >
            <option value="newest">
              החדשים ביותר
            </option>

            <option value="price-low">
              מחיר: מהנמוך לגבוה
            </option>

            <option value="price-high">
              מחיר: מהגבוה לנמוך
            </option>

            <option value="name">
              שם המוצר
            </option>
          </select>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-neutral-50 p-4 sm:mb-8 sm:p-6">
          <div className="mb-4 flex items-center justify-between sm:mb-5">
            <h3 className="font-semibold">
              סינון מוצרים
            </h3>

            <button
              type="button"
              onClick={() =>
                setShowFilters(false)
              }
              aria-label="סגור סינון"
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-white hover:text-black"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <label className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm sm:px-4">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(event) =>
                  setOnlyInStock(
                    event.target.checked
                  )
                }
                className="h-4 w-4 accent-black"
              />

              במלאי
            </label>

            <label className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm sm:px-4">
              <input
                type="checkbox"
                checked={onlySale}
                onChange={(event) =>
                  setOnlySale(
                    event.target.checked
                  )
                }
                className="h-4 w-4 accent-black"
              />

              במבצע
            </label>

            <label className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm sm:px-4">
              <input
                type="checkbox"
                checked={onlyNew}
                onChange={(event) =>
                  setOnlyNew(
                    event.target.checked
                  )
                }
                className="h-4 w-4 accent-black"
              />

              חדש
            </label>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="min-h-12 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-600 transition hover:border-black hover:text-black sm:border-0 sm:bg-transparent sm:underline sm:underline-offset-4"
              >
                ניקוי סינון
              </button>
            )}
          </div>
        </div>
      )}

      {filteredAndSortedProducts.length ===
      0 ? (
        <div className="rounded-2xl border border-gray-200 bg-neutral-50 px-5 py-12 text-center sm:px-6 sm:py-16">
          <h3 className="text-lg font-semibold sm:text-xl">
            לא נמצאו מוצרים מתאימים
          </h3>

          <p className="mt-3 text-sm text-gray-500 sm:text-base">
            נסו לשנות את הסינון שבחרתם.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-6 min-h-12 rounded-xl bg-black px-7 py-3 font-medium text-white transition hover:bg-gray-800"
          >
            הצגת כל המוצרים
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-4 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {displayedProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}
          </div>

          {hasMoreProducts && (
            <div className="mt-10 flex flex-col items-center gap-3 sm:mt-12">
              <button
                type="button"
                onClick={loadMore}
                className="flex min-h-12 min-w-44 items-center justify-center gap-2 rounded-xl border border-black bg-white px-7 py-3.5 text-sm font-medium transition hover:bg-black hover:text-white"
              >
                טען עוד
                <ChevronDown
                  size={18}
                  strokeWidth={1.8}
                />
              </button>

              <p className="text-xs text-gray-400">
                נשארו{" "}
                {filteredAndSortedProducts.length -
                  displayedProducts.length}{" "}
                מוצרים להצגה
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
