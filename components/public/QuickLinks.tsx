"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { Shirt, CalendarCheck, Search, MessageSquare, ArrowRight, type LucideIcon } from "lucide-react";
import RevealText from "@/components/public/RevealText";
import type { SectionContent } from "@/lib/types";

/** Destinations and icons are fixed — only the wording is editable. */
const TARGETS = [
  { href: "/catalog", icon: Shirt },
  { href: "/book", icon: CalendarCheck },
  { href: "/track", icon: Search },
  { href: "/contact", icon: MessageSquare },
];

function QuickLinkCard({
  href,
  icon: Icon,
  title,
  description,
  index,
  stacked,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
  /** When the row is 4-across, the cards start piled in the middle and deal out. */
  stacked: boolean;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const springConfig = { stiffness: 250, damping: 20 };
  const rotateX = useSpring(useTransform(py, [0, 1], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(px, [0, 1], [-10, 10]), springConfig);
  const glow = useMotionTemplate`radial-gradient(220px circle at ${useTransform(px, [0, 1], ["0%", "100%"])} ${useTransform(py, [0, 1], ["0%", "100%"])}, rgba(234,106,18,0.16), transparent 70%)`;

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      initial={
        stacked
          ? { opacity: 0, x: `${(1.5 - index) * 100}%`, y: -40, scale: 0.88, rotate: (index - 1.5) * 4 }
          : { opacity: 0, y: -60, scale: 0.94 }
      }
      whileInView={{ opacity: 1, x: "0%", y: 0, scale: 1, rotate: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.85,
        delay: 0.25 + index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ perspective: 800 }}
      className="h-full"
    >
      <motion.div
        style={{ rotateX, rotateY }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <Link
          ref={cardRef}
          href={href}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-accent/10"
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            aria-hidden
            style={{ background: glow }}
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />

          <motion.span
            whileHover={{ rotate: -10, scale: 1.12 }}
            transition={{ type: "spring", stiffness: 300, damping: 12 }}
            className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent"
            style={{ transform: "translateZ(30px)" }}
          >
            <span className="absolute inset-0 scale-100 rounded-xl bg-accent/20 opacity-0 [animation:bob_1.6s_ease-in-out_infinite] group-hover:opacity-100" />
            <Icon className="relative h-6 w-6" strokeWidth={1.5} />
          </motion.span>

          <h3 className="relative mt-4 font-serif text-lg" style={{ transform: "translateZ(20px)" }}>
            {title}
          </h3>
          <p className="relative mt-1 flex-1 text-sm text-muted" style={{ transform: "translateZ(10px)" }}>
            {description}
          </p>
          <span className="relative mt-4 flex items-center gap-1 text-sm text-accent opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
            Go <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function QuickLinks({ content }: { content: SectionContent["quickLinks"] }) {
  // The "deal out from the middle" entrance only makes sense when all four sit
  // on one row; stacked on narrow screens it would just look broken.
  const [stacked, setStacked] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setStacked(mq.matches && !reduced.matches);
    update();
    mq.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-accent/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <h2 className="font-serif text-2xl sm:text-3xl">
          <RevealText text={content.heading} />
        </h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-1 text-muted"
        >
          {content.subheading}
        </motion.p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {TARGETS.map((target, i) => (
            <QuickLinkCard
              key={target.href}
              index={i}
              stacked={stacked}
              href={target.href}
              icon={target.icon}
              title={content.items[i]?.title ?? ""}
              description={content.items[i]?.description ?? ""}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
