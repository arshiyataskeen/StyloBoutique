"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Ruler, X } from "lucide-react";
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
  phone,
  siteName,
}: {
  model: ModelDTO;
  phone?: string | null;
  siteName: string;
}) {
  const category = typeof model.category === "string" ? null : model.category;
  const images = model.images;
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const current = images[active];
  const hidden = isPriceHidden(model.priceDisplay);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* main photo */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-background">
            {current ? (
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={current}
                  src={current}
                  alt={model.name}
                  onClick={() => setZoomed(true)}
                  // Wipes up from the lower edge while settling out of a slight
                  // zoom, so switching thumbnails reads as a reveal, not a blink.
                  initial={{ opacity: 0, scale: 1.06, clipPath: "inset(14% 0% 0% 0%)" }}
                  animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.55, ease: EASE }}
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
                phone={phone}
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

          {/* every photo of this piece, in a grid rather than one at a time */}
          {images.length > 1 && (
            <motion.div variants={row} className="mt-9 border-t border-border/80 pt-6">
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted">
                {images.length} photos of this design
              </p>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                {images.map((url, i) => (
                  <motion.button
                    key={url}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`View photo ${i + 1}`}
                    aria-current={i === active}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.3 + i * 0.04, ease: EASE }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                      i === active ? "border-accent" : "border-transparent hover:border-accent/40"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </motion.button>
                ))}
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
