"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Ruler, X, ArrowLeft } from "lucide-react";
import AskPriceButtons from "@/components/public/AskPriceButtons";
import { isPriceHidden, priceLabel } from "@/lib/pricing";
import type { ModelDTO } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The detail column arrives as one cascade — category, title, price, copy, CTA —
 * rather than each element animating on its own timer. One container owns the
 * rhythm, so adding a row later cannot fall out of step.
 */
const column = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};

const row = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export default function ModelDetail({
  model,
  whatsapp,
  siteName,
}: {
  model: ModelDTO;
  whatsapp?: string | null;
  siteName: string;
}) {
  const category = typeof model.category === "string" ? null : model.category;
  const images = model.images;
  /** Everything but the cover — see the note on the thumbnail strip below. */
  const gallery = images.slice(1);
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const current = images[active];
  const hidden = isPriceHidden(model.priceDisplay);
  /** Shape of the photo on show, so the frame can take it. 0.8 until measured. */
  const [ratio, setRatio] = useState(0.8);

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 sm:py-8">
      {/* Back to where the design came from, so a visitor is never stranded on
          a design page with only the browser button to get out. */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="mb-5"
      >
        <Link
          href={category ? `/catalog/${category.slug}` : "/catalog"}
          className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {category ? `Back to ${category.name}` : "Back to catalog"}
        </Link>
      </motion.div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* main photo */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {/* The frame takes the photo's own shape, eased so switching between
              a portrait and a square reads as the frame settling. */}
          <div
            style={{ aspectRatio: ratio }}
            className="relative overflow-hidden rounded-2xl border border-border bg-background transition-[aspect-ratio] duration-500 ease-out"
          >
            {current ? (
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={current}
                  src={current}
                  alt={model.name}
                  onClick={() => setZoomed(true)}
                  onLoad={(event) => {
                    const img = event.currentTarget;
                    if (img.naturalWidth && img.naturalHeight) {
                      setRatio(img.naturalWidth / img.naturalHeight);
                    }
                  }}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.55, ease: EASE }}
                  // cover is safe because the frame has taken the photo's own
                  // shape — there is nothing left to crop.
                  className="absolute inset-0 h-full w-full cursor-zoom-in object-cover"
                />
              </AnimatePresence>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#f6f1e8] via-[#efe6d6] to-[#e6d8c2]">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/70 text-accent/70 shadow-inner shadow-black/5">
                  <Ruler className="h-9 w-9" strokeWidth={1.25} />
                </span>
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted/80">
                  Made to measure
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* details */}
        <motion.div variants={column} initial="hidden" animate="show" className="lg:pt-2">
          {category && (
            <motion.div variants={row}>
              <Link
                href={`/catalog/${category.slug}`}
                className="text-xs uppercase tracking-[0.18em] text-accent hover:underline"
              >
                {category.name}
              </Link>
            </motion.div>
          )}

          <motion.h1
            variants={row}
            className="mt-2 font-serif text-3xl leading-tight sm:text-4xl"
          >
            {model.name}
          </motion.h1>

          <motion.div variants={row} className="mt-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span
                className={
                  hidden
                    ? "text-lg font-medium text-foreground/70"
                    : "text-2xl font-medium text-accent"
                }
              >
                {priceLabel(model.price, model.priceDisplay)}
              </span>
              {!hidden && model.priceNote && (
                <span className="text-sm text-muted">{model.priceNote}</span>
              )}
            </div>

            {hidden && (
              <AskPriceButtons
                whatsapp={whatsapp}
                siteName={siteName}
                designName={model.name}
                className="mt-4"
              />
            )}
          </motion.div>

          <motion.p variants={row} className="mt-5 leading-relaxed text-foreground/80">
            {model.description}
          </motion.p>

          <motion.div variants={row}>
            <Link
              href={`/book?modelId=${model.id}`}
              className="mt-7 block w-full rounded-full bg-foreground px-6 py-3.5 text-center text-sm text-background transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/20 active:scale-95 sm:inline-block sm:w-auto sm:py-3"
            >
              Book This Design
            </Link>
          </motion.div>

          {/*
            The views of the piece. The cover is left out: it is a branded
            title card rather than a photograph of the garment, and showing it
            here put a picture of the design's own name among its close-ups.
          */}
          {gallery.length > 0 && (
            <motion.div variants={row} className="mt-9 border-t border-border/80 pt-6">
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted">
                {gallery.length} {gallery.length === 1 ? "view" : "views"} of this design
              </p>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                {gallery.map((url, i) => {
                  // Index within the full array, since `active` indexes that.
                  const realIndex = i + 1;
                  return (
                    <motion.button
                      key={url}
                      type="button"
                      onClick={() => setActive(realIndex)}
                      aria-label={`View photo ${realIndex}`}
                      aria-current={realIndex === active}
                      // Each thumbnail turns up out of the page rather than
                      // simply appearing, staggered along the row.
                      initial={{ opacity: 0, y: 14, rotateX: -25 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ duration: 0.45, delay: 0.3 + i * 0.06, ease: EASE }}
                      whileHover={{ scale: 1.07, y: -3 }}
                      whileTap={{ scale: 0.96 }}
                      style={{ transformPerspective: 600 }}
                      className={`group/thumb relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                        realIndex === active
                          ? "border-accent"
                          : "border-transparent hover:border-accent/40"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/thumb:scale-110"
                      />
                      <span
                        className={`absolute inset-0 bg-accent/20 transition-opacity duration-300 ${
                          realIndex === active ? "opacity-0" : "opacity-0 group-hover/thumb:opacity-100"
                        }`}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {zoomed && current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomed(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8"
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.img
              src={current}
              alt={model.name}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="max-h-[85dvh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
