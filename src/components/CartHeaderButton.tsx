"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { useCart } from "../context/CartContext";

export default function CartHeaderButton() {
  const { cartCount } = useCart();

  return (
    <Link
      href="/cart"
      aria-label="מעבר לסל הקניות"
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-50"
    >
      <ShoppingBag
        size={22}
        strokeWidth={1.7}
      />

      {cartCount > 0 && (
        <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[11px] font-semibold text-white">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </Link>
  );
}