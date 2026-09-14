import type { MetadataRoute } from "next";
import { getActiveProducts } from "../lib/products";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "", "/new", "/sale", "/custom-sofas",
    "/category/armchairs", "/category/tables",
    "/category/decor", "/category/mattresses",
    "/shipping", "/returns", "/faq", "/about",
    "/privacy", "/accessibility",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));

  try {
    const products = await getActiveProducts();

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${siteUrl}/products/${encodeURIComponent(product.slug)}`,
      lastModified: product.created_at
        ? new Date(product.created_at)
        : now,
      changeFrequency: "weekly",
      priority: 0.9,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    console.error("Failed to load products for sitemap:", error);
    return staticRoutes;
  }
}
