"use client";

import { useMemo, useState } from "react";

type ProductGalleryProps = {
  name: string;
  image: string | null;
  images: string[];
};

export default function ProductGallery({
  name,
  image,
  images,
}: ProductGalleryProps) {
  const galleryImages = useMemo(() => {
    const allImages = [
      ...(image ? [image] : []),
      ...(images || []),
    ].filter(Boolean);

    return Array.from(new Set(allImages));
  }, [image, images]);

  const [selectedImage, setSelectedImage] = useState(
    galleryImages[0] || ""
  );

  if (galleryImages.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-neutral-100 text-sm text-gray-400">
        אין תמונה למוצר
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[90px_1fr]">
      {galleryImages.length > 1 && (
        <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
          {galleryImages.map((imageUrl, index) => (
            <button
              key={`${imageUrl}-${index}`}
              type="button"
              onClick={() => setSelectedImage(imageUrl)}
              className={`h-20 w-20 shrink-0 overflow-hidden border bg-neutral-100 transition sm:h-24 sm:w-24 lg:h-[90px] lg:w-[90px] ${
                selectedImage === imageUrl
                  ? "border-black"
                  : "border-gray-200 hover:border-gray-500"
              }`}
              aria-label={`הצגת תמונה ${index + 1} של ${name}`}
            >
              <img
                src={imageUrl}
                alt={`${name} - תמונה ${index + 1}`}
                width={180}
                height={180}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="order-1 overflow-hidden bg-neutral-100 lg:order-2">
        <div className="aspect-square">
          <img
            key={selectedImage}
            src={selectedImage}
            alt={name}
            width={1200}
            height={1200}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
