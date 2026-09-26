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
    // h-full, not a fixed aspect: the row's height comes from the cylinder
    // beside it, and this matches it rather than forcing a taller box that the
    // cylinder then cannot fill.
    <div className="relative h-full min-h-[260px] overflow-hidden rounded-2xl border border-border bg-surface">
      <AnimatePresence initial={false}>
        <motion.div
          key={images[index]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // The slow zoom this used to have grew the photo past its frame,
          // which is a crop by another name. The long overlapping fade carries
          // the "slow motion" on its own.
          transition={{ opacity: { duration: 1.6, ease: EASE } }}
          className="absolute inset-0"
        >
          {/*
            The same photo, enlarged and blurred, sitting behind the real one.
            Contained photos leave bare strips wherever their shape differs
            from the frame — square shots in a 4:5 frame left a white band top
            and bottom. This fills those strips with the photo's own colours
            instead, so nothing is cropped and no empty space shows.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[index]}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
          />
          {/* contain, so the whole garment is visible. These photos carry a logo
              in one corner and cover was cutting it, along with the hem. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[index]}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain"
          />
        </motion.div>
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
