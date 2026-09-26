"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

const DURATION_MS = 3200;
const EASE = [0.22, 1, 0.36, 1] as const;
/** Slow in, slow out — reads as one deliberate movement rather than a snap. */
const CURTAIN_EASE = [0.65, 0, 0.35, 1] as const;

const CRAFTS = ["Embroidery", "Maggam Work", "Stitching"];

const SPARKLES = [
  { top: "24%", left: "18%", delay: 1.0 },
  { top: "32%", left: "80%", delay: 1.5 },
  { top: "66%", left: "24%", delay: 1.9 },
  { top: "70%", left: "76%", delay: 1.3 },
  { top: "18%", left: "62%", delay: 2.2 },
  { top: "58%", left: "10%", delay: 2.5 },
];

const subscribe = () => () => {};
const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The screen parts down the middle: top lifts, bottom drops, as one motion. */
const topCurtain: Variants = {
  visible: { y: "0%" },
  exit: { y: "-100%", transition: { duration: 0.9, delay: 0.22, ease: CURTAIN_EASE } },
};

const bottomCurtain: Variants = {
  visible: { y: "0%" },
  exit: { y: "100%", transition: { duration: 0.9, delay: 0.22, ease: CURTAIN_EASE } },
};

const contentVariants: Variants = {
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.3, ease: "easeIn" } },
};

export default function IntroOverlay({
  logoUrl,
  siteName,
}: {
  logoUrl: string;
  siteName: string;
}) {
  // This component lives in the site layout, so it does not remount on in-site
  // navigation — the intro plays on a fresh page load and never interrupts
  // someone clicking between pages.
  const reduced = useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
  const [finished, setFinished] = useState(false);
  const show = !reduced && !finished;

  useEffect(() => {
    if (!show) return;

    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => setFinished(true), DURATION_MS);

    function skipOnKey(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") setFinished(true);
    }
    window.addEventListener("keydown", skipOnKey);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", skipOnKey);
      document.body.style.overflow = "";
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          role="button"
          aria-label="Skip intro"
          onClick={() => setFinished(true)}
          initial="visible"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[100] cursor-pointer overflow-hidden"
        >
          {/* the two halves overlap by a pixel so no seam shows while they part */}
          <motion.div
            variants={topCurtain}
            className="absolute inset-x-0 top-0 h-[calc(50%+1px)] bg-background"
          />
          <motion.div
            variants={bottomCurtain}
            className="absolute inset-x-0 bottom-0 h-[calc(50%+1px)] bg-background"
          />

          <motion.div
            variants={contentVariants}
            className="relative flex h-full flex-col items-center justify-center px-6"
          >
            {/* warm light blooming behind the mark */}
            <motion.span
              aria-hidden
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: [0, 0.5, 0.42], scale: [0.75, 1.05, 1] }}
              transition={{ duration: 3.2, ease: "easeInOut", times: [0, 0.55, 1] }}
              className="pointer-events-none absolute h-[min(92vw,480px)] w-[min(92vw,480px)] rounded-full bg-accent/20 blur-[100px]"
            />

            {/* drifting sparkles */}
            {SPARKLES.map((s, i) => (
              <motion.span
                key={i}
                aria-hidden
                style={{ top: s.top, left: s.left }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.3], y: [0, -22] }}
                transition={{ duration: 1.8, delay: s.delay, ease: "easeOut" }}
                className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-accent/70"
              />
            ))}

            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.18em" }}
              animate={{ opacity: 1, letterSpacing: "0.5em" }}
              transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
              className="relative mb-9 pl-[0.5em] text-[10px] uppercase text-muted/80 sm:text-[11px]"
            >
              Welcome to
            </motion.p>

            {/* logo, with light sweeping across it */}
            <div className="relative overflow-hidden">
              <motion.img
                src={logoUrl}
                alt={siteName}
                initial={{ opacity: 0, scale: 0.93, y: 14 }}
                animate={{ opacity: 1, scale: [0.93, 1, 1.02], y: 0 }}
                transition={{
                  opacity: { duration: 0.9, delay: 0.3, ease: EASE },
                  y: { duration: 0.9, delay: 0.3, ease: EASE },
                  scale: { duration: 2.9, delay: 0.3, times: [0, 0.32, 1], ease: EASE },
                }}
                className="w-[min(80vw,420px)] object-contain"
              />
              <motion.span
                aria-hidden
                initial={{ x: "-160%" }}
                animate={{ x: "160%" }}
                transition={{ duration: 1.1, delay: 0.95, ease: "easeInOut" }}
                className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/65 to-transparent"
              />
            </div>

            {/* One line only: the stitch sews itself across over the full
                duration, so it is the progress indicator as well. */}
            <div className="relative mt-10 w-[min(58vw,260px)]">
              <span className="block w-full border-t-2 border-dashed border-border" />
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: (DURATION_MS - 500) / 1000, delay: 0.5, ease: "linear" }}
                className="absolute inset-y-0 left-0 overflow-hidden"
              >
                <span className="block w-[min(58vw,260px)] border-t-2 border-dashed border-accent" />
              </motion.span>
            </div>

            {/* the three crafts, revealed one at a time */}
            <p className="relative mt-9 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.28em] text-muted sm:text-xs">
              {CRAFTS.map((word, i) => (
                <span key={word} className="flex items-center gap-3">
                  {i > 0 && (
                    <motion.span
                      aria-hidden
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 1.45 + i * 0.18 }}
                      className="text-accent"
                    >
                      ·
                    </motion.span>
                  )}
                  <span className="inline-block overflow-hidden">
                    <motion.span
                      initial={{ y: "120%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 0.7, delay: 1.4 + i * 0.18, ease: EASE }}
                      className="inline-block"
                    >
                      {word}
                    </motion.span>
                  </span>
                </span>
              ))}
            </p>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.6, delay: 1.9 }}
              className="absolute bottom-10 text-[9px] uppercase tracking-[0.3em] text-muted"
            >
              Tap to skip
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
