"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

type VariantStockRow = {
  id: number;
  product_id: number;
  stock: number;
};

type VariantStockContextValue = {
  loading: boolean;
  getProductVariantsStock: (
    productId: number
  ) => VariantStockRow[];
};

const VariantStockContext =
  createContext<VariantStockContextValue | null>(null);

export function VariantStockProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [variants, setVariants] =
    useState<VariantStockRow[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadVariantStock() {
      const { data, error } =
        await supabase
          .from("product_variants")
          .select("id, product_id, stock")
          .eq("active", true);

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Error loading variant stock:",
          error
        );

        setVariants([]);
        setLoading(false);
        return;
      }

      setVariants(
        (data || []).map((variant) => ({
          id: Number(variant.id),
          product_id: Number(
            variant.product_id
          ),
          stock: Number(variant.stock),
        }))
      );

      setLoading(false);
    }

    loadVariantStock();

    return () => {
      cancelled = true;
    };
  }, []);

  const variantsByProduct = useMemo(() => {
    const map =
      new Map<number, VariantStockRow[]>();

    for (const variant of variants) {
      const current =
        map.get(variant.product_id) || [];

      current.push(variant);

      map.set(
        variant.product_id,
        current
      );
    }

    return map;
  }, [variants]);

  const value = useMemo(
    () => ({
      loading,
      getProductVariantsStock: (
        productId: number
      ) =>
        variantsByProduct.get(productId) ||
        [],
    }),
    [loading, variantsByProduct]
  );

  return (
    <VariantStockContext.Provider value={value}>
      {children}
    </VariantStockContext.Provider>
  );
}

export function useVariantStock() {
  const context =
    useContext(VariantStockContext);

  if (!context) {
    throw new Error(
      "useVariantStock must be used inside VariantStockProvider"
    );
  }

  return context;
}
