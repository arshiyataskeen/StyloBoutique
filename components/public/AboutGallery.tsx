"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Scissors, X } from "lucide-react";
import RevealText from "@/components/public/RevealText";
import GalleryCollage from "@/components/public/GalleryCollage";
import type { SiteSettingsDTO } from "@/lib/types";

export default function AboutGallery({ settings }: { settings: SiteSettingsDTO }) {
  const images = settings.galleryImages;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Each tile drifts at a slightly different rate as the section passes through
  // the viewport, so the grid feels layered rather than flat.
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start end", "end start"],
  });
  // One rate per column, so columns drift together instead of each tile
  // wandering independently and making the grid look misaligned.
  const driftA = useTransform(scrollYProgress, [0, 1], [14, -14]);
  const driftB = useTransform(scrollYProgress, [0, 1], [-10, 10]);
  const driftC = useTransform(scrollYProgress, [0, 1], [8, -8]);
  const drifts = [driftA, driftB, driftC];

  useEffect(() => {
    if (activeIndex === null) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveIndex(null);
      if (e.key === "ArrowRight") setActiveIndex((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setActiveIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, images.length]);

  return (
    <section className="relative overflow-hidden border-t border-border/80 bg-band">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:gap-10 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent"
          >
            <Scissors className="h-3.5 w-3.5" /> Our Story
          </motion.p>
          <h2 className="font-serif text-3xl leading-tight sm:text-4xl">
            <RevealText text={settings.aboutHeading} />
          </h2>
          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{ transformOrigin: "left" }}
            className="mt-3 block h-[3px] w-12 rounded-full bg-accent"
          />
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 max-w-md leading-relaxed text-foreground/80"
          >
            {settings.aboutText}
          </motion.p>
        </div>

        {images.length > 0 ? (
          <motion.div ref={gridRef} style={{ y: drifts[0] }}>
            <GalleryCollage
              images={images}
              onOpen={(url) => setActiveIndex(images.indexOf(url))}
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-dashed border-border bg-gradient-to-br from-[#f6f1e8] via-[#efe6d6] to-[#e6d8c2]"
              >
                <Scissors className="h-6 w-6 text-accent/40" strokeWidth={1.25} />
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8"
            onClick={() => setActiveIndex(null)}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setActiveIndex(null)}
              className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
                  }}
                  className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((i) => (i === null ? i : (i + 1) % images.length));
                  }}
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <motion.img
              key={activeIndex}
              src={images[activeIndex]}
              alt=""
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85dvh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
