"use client";

import { motion } from "framer-motion";
import { ZoomIn } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The About gallery, as a masonry.
 *
 * This used to be four fixed frames on a 3x3 square grid — one wide, one tall,
 * one large — with `object-cover` filling each. That looks tidy only when the
 * photos happen to match the slots they land in. They do not: the shop's photos
 * are a mix of portrait (3:4) and square, so a portrait shot dropped into the
 * wide slot had most of its height cut away, and the garment with it.
 *
 * Columns instead. Each photo keeps its own aspect ratio and is never cropped —
 * the column simply grows to fit it. Every photo is shown rather than four at a
 * time on a rotation, which also removes the layout jump that swapping images
 * of different heights would otherwise cause.
 */
export default function GalleryCollage({
  images,
  onOpen,
}: {
  images: string[];
  onOpen: (url: string) => void;
}) {
  if (images.length === 0) return null;

  return (
    <div className="columns-2 gap-3 sm:gap-4">
      {images.map((url, i) => (
        <motion.button
          key={url}
          type="button"
          onClick={() => onOpen(url)}
          aria-label="View full-size photo"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          // Capped so a long gallery does not trail off into a slow drip.
          transition={{ duration: 0.55, delay: Math.min(i, 5) * 0.06, ease: EASE }}
          className="group relative mb-3 block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border bg-background sm:mb-4"
          // break-inside-avoid keeps a photo from being split across the
          // column boundary, which is what CSS columns would otherwise do.
          style={{ breakInside: "avoid" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            loading="lazy"
            decoding="async"
            // No height and no object-fit: the image sets its own height from
            // its real proportions, which is the whole point here.
            className="block w-full transition-transform duration-700 ease-out group-hover:scale-105"
          />

          <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/25 group-hover:opacity-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black">
              <ZoomIn className="h-4 w-4" strokeWidth={1.5} />
            </span>
          </span>
        </motion.button>
      ))}
    </div>
  );
}
