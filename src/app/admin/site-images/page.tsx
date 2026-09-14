"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ImageIcon,
  Loader2,
  RefreshCw,
  Upload,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

type SiteImage = {
  id: number;
  image_key: string;
  label: string;
  image_url: string;
  updated_at: string;
};

const imageOrder = [
  "hero",
  "category_dining",
  "category_armchairs",
  "category_coffee",
  "category_decor",
  "category_mattresses",
  "custom_sofas",
  "sale",
];

export default function SiteImagesAdminPage() {
  const router = useRouter();

  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    async function initialize() {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.replace("/admin/login");
        return;
      }

      setAuthorized(true);
      await loadImages();
    }

    initialize();
  }, [router]);

  async function loadImages() {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("site_images")
      .select("*");

    if (loadError) {
      console.error(loadError);
      setError(`לא ניתן לטעון את תמונות האתר: ${loadError.message}`);
      setLoading(false);
      return;
    }

    const sorted = ((data || []) as SiteImage[]).sort(
      (a, b) =>
        imageOrder.indexOf(a.image_key) -
        imageOrder.indexOf(b.image_key)
    );

    setImages(sorted);
    setLoading(false);
  }

  async function uploadImage(
    image: SiteImage,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("אפשר להעלות רק תמונות JPG, PNG או WebP.");
      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("התמונה חייבת להיות עד 5MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploadingKey(image.image_key);

      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath =
        `site/${image.image_key}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from("site_images")
        .update({
          image_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("image_key", image.image_key);

      if (updateError) {
        throw updateError;
      }

      setImages((current) =>
        current.map((item) =>
          item.image_key === image.image_key
            ? {
                ...item,
                image_url: publicUrl,
                updated_at: new Date().toISOString(),
              }
            : item
        )
      );
    } catch (uploadError) {
      console.error(uploadError);

      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "שגיאה לא ידועה";

      setError(`לא ניתן להעלות את התמונה: ${message}`);
    } finally {
      setUploadingKey(null);
      event.target.value = "";
    }
  }

  if (!authorized || loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-neutral-50"
      >
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="animate-spin" size={20} />
          טוען...
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-neutral-50 text-black">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-6">
          <div>
            <p className="text-sm text-gray-500">HOME DESIGN ADMIN</p>
            <h1 className="mt-1 text-2xl font-semibold">
              תמונות האתר
            </h1>
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm transition hover:text-gray-500"
          >
            <ArrowRight size={17} />
            חזרה לניהול
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              ניהול תמונות דף הבית
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              החלפת תמונה כאן תעדכן את דף הבית ללא שינוי בקוד.
            </p>
          </div>

          <button
            type="button"
            onClick={loadImages}
            className="flex items-center gap-2 border border-gray-300 bg-white px-4 py-2.5 text-sm transition hover:border-black"
          >
            <RefreshCw size={16} />
            רענון
          </button>
        </div>

        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => {
            const uploading = uploadingKey === image.image_key;

            return (
              <article
                key={image.image_key}
                className="overflow-hidden border border-gray-200 bg-white"
              >
                <div className="aspect-[4/3] bg-neutral-100">
                  {image.image_url ? (
                    <img
                      src={image.image_url}
                      alt={image.label}
                      width={800}
                      height={600}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <ImageIcon size={36} />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-semibold">{image.label}</h3>

                  <p
                    dir="ltr"
                    className="mt-2 truncate text-left text-xs text-gray-400"
                    title={image.image_url}
                  >
                    {image.image_url}
                  </p>

                  <label
                    className={`mt-5 flex cursor-pointer items-center justify-center gap-2 bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 ${
                      uploading ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        מעלה תמונה...
                      </>
                    ) : (
                      <>
                        <Upload size={17} />
                        החלפת תמונה
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploading}
                      onChange={(event) => uploadImage(image, event)}
                    />
                  </label>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
