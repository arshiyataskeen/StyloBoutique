"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function FadeIn({
  children,
  delay = 0,
  y = 14,
  className,
  onScroll = false,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** Reveal when scrolled into view instead of on mount. */
  onScroll?: boolean;
}) {
  const animation = onScroll
    ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" } }
    : { animate: { opacity: 1, y: 0 } };

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      {...animation}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
