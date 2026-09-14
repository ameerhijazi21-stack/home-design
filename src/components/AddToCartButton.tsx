"use client";

import { ShoppingBag } from "lucide-react";

import { useCart } from "../context/CartContext";

type AddToCartButtonProps = {
  product: {
    id: number;
    slug: string;
    name: string;
    price: number;
    image?: string | null;
    images?: string[];
    sku?: string | null;
    stock?: number;
  };
};

export default function AddToCartButton({
  product,
}: AddToCartButtonProps) {
  const { addToCart } = useCart();

  const outOfStock =
    typeof product.stock === "number" &&
    product.stock <= 0;

  function handleAddToCart() {
    if (outOfStock) {
      return;
    }

    const productImages =
      product.images && product.images.length > 0
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
    });
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={outOfStock}
      className="flex w-full items-center justify-center gap-2 bg-black px-6 py-4 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      <ShoppingBag size={19} />

      {outOfStock
        ? "אזל מהמלאי"
        : "הוספה לסל"}
    </button>
  );
}