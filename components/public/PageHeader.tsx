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
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/65 to-black/45" />
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
        className={`relative mx-auto max-w-6xl px-5 ${hasImage ? "py-16 sm:py-24" : "py-10 sm:py-14"}`}
      >
        <h1
          className={`font-serif text-3xl sm:text-4xl ${hasImage ? "text-white sm:text-5xl" : ""}`}
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
