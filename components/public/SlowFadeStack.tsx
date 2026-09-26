"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const HOLD_MS = 4200;

/**
 * A single frame that drifts slowly through the photo set — deliberately calm,
 * to balance the constantly-turning cylinder beside it.
 */
export default function SlowFadeStack({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => setIndex((i) => (i + 1) % images.length), HOLD_MS);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-surface">
      <AnimatePresence initial={false}>
        <motion.img
          key={images[index]}
          src={images[index]}
          alt=""
          loading="lazy"
          decoding="async"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // The slow zoom this used to have grew the photo past its frame,
          // which is a crop by another name. The long overlapping fade carries
          // the "slow motion" on its own.
          transition={{ opacity: { duration: 1.6, ease: EASE } }}
          // contain, so the whole garment is visible. These photos carry a logo
          // in one corner and cover was cutting it, along with the hem.
          className="absolute inset-0 h-full w-full object-contain"
        />
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-black/45 to-transparent pb-2 pt-10">
        {images.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show photo ${i + 1}`}
            aria-current={i === index}
            // The dot stays small but the button is finger-sized around it.
            className="flex h-9 w-5 items-center justify-center"
          >
            <span
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
