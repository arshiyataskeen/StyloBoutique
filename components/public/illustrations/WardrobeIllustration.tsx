"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

const EASE = [0.22, 1, 0.36, 1] as const;

const GARMENTS = [
  { left: "28%", color: "var(--color-accent)", heightPx: 52, delay: 0 },
  { left: "48%", color: "currentColor", heightPx: 42, delay: 0.5 },
  { left: "68%", color: "var(--color-accent)", heightPx: 48, delay: 1 },
];

/**
 * A wardrobe whose doors swing open the first time it scrolls into view,
 * revealing three garments on hangers that sway gently afterward.
 */
export default function WardrobeIllustration({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const swayLoop = reduced ? 0 : Infinity;
  const doorOpen = reduced ? -8 : -108;
  const doorOpenRight = reduced ? 8 : 108;

  return (
    <div
      className={`relative aspect-[6/5] w-full text-foreground ${className ?? ""}`}
      style={{ perspective: 700 }}
    >
      {/* interior */}
      <div className="absolute inset-0 overflow-hidden rounded-xl border border-border bg-gradient-to-b from-[#f6f1e8] to-[#e9ddc8]">
        <div className="absolute left-[10%] right-[10%] top-[16%] h-[2px] rounded-full bg-foreground/30" />

        {GARMENTS.map((g, i) => (
          <motion.div
            key={i}
            className="absolute top-[16%]"
            style={{ left: g.left, transformOrigin: "top center" }}
            initial={{ opacity: 0, y: -6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.9 + g.delay * 0.15 }}
          >
            <motion.div
              style={{ transformOrigin: "top center" }}
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ duration: 2.6 + i * 0.4, delay: g.delay, repeat: swayLoop, ease: "easeInOut" }}
            >
              {/* hanger hook */}
              <div className="mx-auto h-2 w-2 rounded-full border border-foreground/40" />
              {/* garment body */}
              <div
                className="mt-0.5 w-6 rounded-b-md rounded-t-sm sm:w-7"
                style={{ height: g.heightPx, background: g.color, opacity: g.color === "currentColor" ? 0.35 : 0.75 }}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* left door */}
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 origin-left rounded-l-xl border border-border bg-surface shadow-md"
        style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
        initial={{ rotateY: 0 }}
        whileInView={{ rotateY: doorOpen }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1, delay: 0.25, ease: EASE }}
      >
        <span className="absolute right-2 top-1/2 h-3 w-1 -translate-y-1/2 rounded-full bg-foreground/40" />
      </motion.div>

      {/* right door */}
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2 origin-right rounded-r-xl border border-border bg-surface shadow-md"
        style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
        initial={{ rotateY: 0 }}
        whileInView={{ rotateY: doorOpenRight }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1, delay: 0.25, ease: EASE }}
      >
        <span className="absolute left-2 top-1/2 h-3 w-1 -translate-y-1/2 rounded-full bg-foreground/40" />
      </motion.div>
    </div>
  );
}
