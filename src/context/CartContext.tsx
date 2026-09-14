"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type CartProduct = {
  id: number;
  slug: string;
  name: string;
  price: number;

  image?: string | null;
  images: string[];

  sku: string;

  variantId?: number | null;
  variantColor?: string | null;
  variantSize?: string | null;
};

export type CartItem = {
  product: CartProduct;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (
    productId: number,
    variantId?: number | null
  ) => void;
  increaseQuantity: (
    productId: number,
    variantId?: number | null
  ) => void;
  decreaseQuantity: (
    productId: number,
    variantId?: number | null
  ) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
};

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

function isSameCartProduct(
  first: CartProduct,
  second: CartProduct
) {
  return (
    first.id === second.id &&
    (first.variantId ?? null) ===
      (second.variantId ?? null)
  );
}

function matchesCartItem(
  item: CartItem,
  productId: number,
  variantId?: number | null
) {
  if (item.product.id !== productId) {
    return false;
  }

  if (variantId === undefined) {
    return true;
  }

  return (
    (item.product.variantId ?? null) ===
    (variantId ?? null)
  );
}

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>(
    []
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem(
      "home-design-cart"
    );

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        } else {
          setItems([]);
        }
      } catch (error) {
        console.error(
          "Error loading cart:",
          error
        );
        setItems([]);
      }
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "home-design-cart",
      JSON.stringify(items)
    );
  }, [items, loaded]);

  function addToCart(product: CartProduct) {
    setItems((currentItems) => {
      const existingItem =
        currentItems.find((item) =>
          isSameCartProduct(
            item.product,
            product
          )
        );

      if (existingItem) {
        return currentItems.map((item) =>
          isSameCartProduct(
            item.product,
            product
          )
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          product,
          quantity: 1,
        },
      ];
    });
  }

  function removeFromCart(
    productId: number,
    variantId?: number | null
  ) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !matchesCartItem(
            item,
            productId,
            variantId
          )
      )
    );
  }

  function increaseQuantity(
    productId: number,
    variantId?: number | null
  ) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        matchesCartItem(
          item,
          productId,
          variantId
        )
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(
    productId: number,
    variantId?: number | null
  ) {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          matchesCartItem(
            item,
            productId,
            variantId
          )
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const cartCount = items.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const cartTotal = items.reduce(
    (total, item) =>
      total +
      Number(item.product.price) *
        item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}
