import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { VariantStockProvider } from "../context/VariantStockContext";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Home Design | ריהוט ועיצוב לבית בטמרה",
    template: "%s | Home Design",
  },
  description:
    "Home Design בטמרה – ריהוט, פינות אוכל, כיסאות, כורסאות, שולחנות, מזרנים, עיצוב לבית וספות בהתאמה אישית.",
  applicationName: "Home Design",
  keywords: [
    "Home Design",
    "ריהוט",
    "ריהוט בטמרה",
    "עיצוב הבית",
    "פינות אוכל",
    "כיסאות",
    "כורסאות",
    "שולחנות",
    "מזרנים",
    "ספות בהתאמה אישית",
  ],
  authors: [{ name: "Home Design" }],
  creator: "Home Design",
  publisher: "Home Design",
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: "Home Design",
    title: "Home Design | ריהוט ועיצוב לבית בטמרה",
    description:
      "ריהוט, מזרנים, עיצוב לבית וספות בהתאמה אישית – Home Design בטמרה.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Home Design | ריהוט ועיצוב לבית בטמרה",
    description:
      "ריהוט, מזרנים, עיצוב לבית וספות בהתאמה אישית – Home Design בטמרה.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={heebo.className}>
        <CartProvider>
          <FavoritesProvider>
            <VariantStockProvider>
              {children}
            </VariantStockProvider>
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}
