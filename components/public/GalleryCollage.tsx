"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ZoomIn } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** An asymmetric editorial arrangement — deliberately not a uniform grid. */
const FRAMES = [
  { area: "1 / 1 / 3 / 3", every: 5200, delay: 0 },     // large, top-left
  { area: "1 / 3 / 2 / 4", every: 4100, delay: 1300 },  // small, top-right
  { area: "2 / 3 / 4 / 4", every: 6300, delay: 2600 },  // tall, right
  { area: "3 / 1 / 4 / 3", every: 4700, delay: 3900 },  // wide, bottom
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

  // Each frame walks the pool in strides of FRAMES.length, so the four of them
  // stay on different photos as they rotate.
  const url = images[(seat + step * FRAMES.length) % images.length];

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(url)}
      aria-label="View full-size photo"
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.015, zIndex: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8, delay: seat * 0.1, ease: EASE }}
      style={{ gridArea: FRAMES[seat].area }}
      className="group relative cursor-zoom-in overflow-hidden rounded-2xl border border-border bg-background"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.img
          key={url}
          src={url}
          alt=""
          loading="lazy"
          decoding="async"
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 1.1, ease: EASE }}
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

export default function GalleryCollage({
  images,
  onOpen,
}: {
  images: string[];
  onOpen: (url: string) => void;
}) {
  if (images.length === 0) return null;

  return (
    <div
      className="grid gap-3 sm:gap-4"
      style={{
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, minmax(0, 1fr))",
        aspectRatio: "1 / 1",
      }}
    >
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
