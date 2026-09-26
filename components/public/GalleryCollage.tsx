"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ZoomIn } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Four frames, each on its own timer so they never change together. */
const FRAMES = [
  { every: 5200, delay: 0 },
  { every: 4100, delay: 1300 },
  { every: 6300, delay: 2600 },
  { every: 4700, delay: 3900 },
];

function Frame({
  images,
  seat,
  every,
  delay,
  onOpen,
}: {
  images: string[];
  seat: number;
  every: number;
  delay: number;
  onOpen: (url: string) => void;
}) {
  const [step, setStep] = useState(0);
  /**
   * The shape of the photo currently in this frame.
   *
   * The frames used to be a fixed 3:4, which suited the portrait shots and left
   * a pale band above and below the square ones. Reading each photo's real
   * proportions when it loads lets the frame take that shape instead, so the
   * picture fills it exactly and nothing is cropped or padded.
   *
   * 0.75 until the first one loads — a sensible starting shape rather than a
   * collapsed box.
   */
  const [ratio, setRatio] = useState(0.75);

  useEffect(() => {
    if (images.length <= FRAMES.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let interval: ReturnType<typeof setInterval>;
    const kickoff = setTimeout(() => {
      setStep((s) => s + 1);
      interval = setInterval(() => setStep((s) => s + 1), every);
    }, delay);

    return () => {
      clearTimeout(kickoff);
      clearInterval(interval);
    };
  }, [every, delay, images.length]);

  // Each frame walks the pool in strides of four, so they stay on different
  // photos as they rotate.
  const url = images[(seat + step * FRAMES.length) % images.length];

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(url)}
      aria-label="View full-size photo"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: seat * 0.08, ease: EASE }}
      // The frame takes the photo's own shape, eased so a change of shape on
      // rotation reads as the frame settling rather than a jump.
      // break-inside-avoid keeps a frame from being split across the column
      // boundary, which is what CSS columns would otherwise do.
      style={{ aspectRatio: ratio, breakInside: "avoid" }}
      className="group relative mb-3 block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border bg-background transition-[aspect-ratio] duration-700 ease-out sm:mb-4"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.img
          key={url}
          src={url}
          alt=""
          loading="lazy"
          decoding="async"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: EASE }}
          onLoad={(event) => {
            const img = event.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              setRatio(img.naturalWidth / img.naturalHeight);
            }
          }}
          // cover is safe here precisely because the frame has taken the
          // photo's own shape — there is nothing left to crop.
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/25 group-hover:opacity-100">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black">
          <ZoomIn className="h-4 w-4" strokeWidth={1.5} />
        </span>
      </span>
    </motion.button>
  );
}

/**
 * The About gallery: four frames that cycle through every photo.
 *
 * Deliberately four rather than all of them — the section sits beside a short
 * paragraph, and a full masonry of every photo made it many times taller than
 * the text it belongs to.
 *
 * The frames are equal 3:4 slots rather than the asymmetric arrangement this
 * once had. A wide slot and a tall slot look good only when the photos happen
 * to match them, and these do not: with a mix of portrait and square, whatever
 * landed in the wrong slot was either cropped to pieces or swimming in empty
 * space. Equal slots plus `object-contain` keeps every photo whole.
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
    // Columns, not a grid: now that each frame takes its photo's own shape they
    // are different heights, and grid cells in a row would stretch to match the
    // tallest — putting the empty space straight back.
    <div className="columns-2 gap-3 sm:gap-4">
      {FRAMES.map((frame, i) => (
        <Frame
          key={i}
          seat={i}
          images={images}
          every={frame.every}
          delay={frame.delay}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
