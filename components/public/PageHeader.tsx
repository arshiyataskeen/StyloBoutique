"use client";

import { motion } from "framer-motion";
import RevealText from "@/components/public/RevealText";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function PageHeader({
  title,
  description,
  image,
  bordered = false,
}: {
  title: string;
  description?: ReactNode;
  /** Optional banner photo — switches the header to a dark, image-backed style. */
  image?: string | null;
  bordered?: boolean;
}) {
  const hasImage = Boolean(image);

  return (
    <div
      className={`relative isolate overflow-hidden ${
        hasImage
          ? "bg-neutral-900"
          : bordered
            ? "border-b border-border/80 bg-surface"
            : ""
      }`}
    >
      {hasImage ? (
        <>
          <motion.div
            aria-hidden
            initial={{ scale: 1.14, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: EASE }}
            className="absolute inset-0 -z-20 motion-reduce:!transform-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image!} alt="" className="h-full w-full object-cover" />
          </motion.div>
          {/*
            Two scrims, because one was not enough. A bottom-up gradient alone
            leaves the top of the image at its brightest — which is exactly
            where the title sits, so white text landed on pale fabric and
            disappeared. The second darkens the left, where all the text is,
            while the right stays clear enough to read the photograph.
          */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/60 to-black/55" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        </>
      ) : (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-accent/5 blur-3xl"
          />
        </>
      )}

      <div
        className={`relative mx-auto max-w-6xl px-5 ${hasImage ? "py-14 sm:py-20" : "py-10 sm:py-14"}`}
      >
        {/*
          One size per breakpoint. This previously carried both sm:text-4xl and
          sm:text-5xl, and which of the two won came down to their order in the
          generated stylesheet rather than anything written here.
        */}
        <h1
          className={
            hasImage
              ? "font-serif text-3xl text-white drop-shadow-sm sm:text-5xl"
              : "font-serif text-3xl sm:text-4xl"
          }
        >
          <RevealText text={title} />
        </h1>
        <motion.span
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
          style={{ transformOrigin: "left" }}
          className="mt-3 block h-[3px] w-12 rounded-full bg-accent"
        />
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
            className={`mt-4 max-w-xl ${hasImage ? "text-white/85" : "text-muted"}`}
          >
            {description}
          </motion.p>
        )}
      </div>
    </div>
  );
}
