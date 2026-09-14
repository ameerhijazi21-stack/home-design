"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type FavoriteProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  old_price: number | null;
  image: string | null;
  category: string;
  subcategory: string | null;
  stock: number;
  on_sale: boolean;
  is_new: boolean;
};

type FavoritesContextType = {
  favorites: FavoriteProduct[];
  favoritesCount: number;
  isFavorite: (productId: number) => boolean;
  addFavorite: (product: FavoriteProduct) => void;
  removeFavorite: (productId: number) => void;
  toggleFavorite: (product: FavoriteProduct) => void;
  clearFavorites: () => void;
};

const FavoritesContext =
  createContext<FavoritesContextType | null>(null);

const STORAGE_KEY = "home-design-favorites";

export function FavoritesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [favorites, setFavorites] = useState<
    FavoriteProduct[]
  >([]);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedFavorites =
        localStorage.getItem(STORAGE_KEY);

      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites);

        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (error) {
      console.error(
        "Error loading favorites:",
        error
      );
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(favorites)
      );
    } catch (error) {
      console.error(
        "Error saving favorites:",
        error
      );
    }
  }, [favorites, loaded]);

  function isFavorite(productId: number) {
    return favorites.some(
      (product) => product.id === productId
    );
  }

  function addFavorite(
    product: FavoriteProduct
  ) {
    setFavorites((current) => {
      const alreadyExists = current.some(
        (item) => item.id === product.id
      );

      if (alreadyExists) {
        return current;
      }

      return [...current, product];
    });
  }

  function removeFavorite(
    productId: number
  ) {
    setFavorites((current) =>
      current.filter(
        (product) =>
          product.id !== productId
      )
    );
  }

  function toggleFavorite(
    product: FavoriteProduct
  ) {
    setFavorites((current) => {
      const alreadyExists = current.some(
        (item) => item.id === product.id
      );

      if (alreadyExists) {
        return current.filter(
          (item) => item.id !== product.id
        );
      }

      return [...current, product];
    });
  }

  function clearFavorites() {
    setFavorites([]);
  }

  const value = useMemo(
    () => ({
      favorites,
      favoritesCount: favorites.length,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearFavorites,
    }),
    [favorites]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(
    FavoritesContext
  );

  if (!context) {
    throw new Error(
      "useFavorites must be used inside FavoritesProvider"
    );
  }

  return context;
}

export type { FavoriteProduct };