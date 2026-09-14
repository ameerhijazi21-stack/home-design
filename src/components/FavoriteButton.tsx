"use client";

import { Heart } from "lucide-react";

import {
  type FavoriteProduct,
  useFavorites,
} from "../context/FavoritesContext";

type FavoriteButtonProps = {
  product: FavoriteProduct;
};

export default function FavoriteButton({
  product,
}: FavoriteButtonProps) {
  const {
    isFavorite,
    toggleFavorite,
  } = useFavorites();

  const active = isFavorite(product.id);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(product)}
      aria-pressed={active}
      aria-label={
        active
          ? "הסרה מהמועדפים"
          : "הוספה למועדפים"
      }
      className={`flex w-full items-center justify-center gap-2 border px-5 py-3.5 text-sm font-medium transition ${
        active
          ? "border-black bg-black text-white"
          : "border-gray-300 bg-white text-black hover:border-black"
      }`}
    >
      <Heart
        size={19}
        strokeWidth={1.7}
        fill={active ? "currentColor" : "none"}
      />

      {active
        ? "נשמר במועדפים"
        : "הוספה למועדפים"}
    </button>
  );
}