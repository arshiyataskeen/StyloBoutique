"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { ReactNode } from "react";

const SPRING = { stiffness: 220, damping: 18, mass: 0.4 };

/**
 * A link that leans toward the cursor while it is nearby, then springs back.
 * The wrapper carries the motion so the anchor itself stays a plain link.
 */
export default function MagneticLink({
  href,
  children,
  className,
  strength = 0.3,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), SPRING);
  const y = useSpring(useMotionValue(0), SPRING);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x, y }}
      whileTap={{ scale: 0.95 }}
      className="inline-block motion-reduce:!transform-none"
    >
      <Link href={href} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}
