"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { Ruler, Shirt, Users, Award, type LucideIcon } from "lucide-react";
import type { HomeStat } from "@/lib/types";

const ICONS: LucideIcon[] = [Award, Shirt, Users, Ruler];

/** Splits "1200+" into 1200 and "+", so the digits can count up in place. */
function splitValue(value: string) {
  const match = value.match(/^(\D*)(\d[\d,]*)(.*)$/);
  if (!match) return null;
  return {
    prefix: match[1],
    number: Number(match[2].replace(/,/g, "")),
    suffix: match[3],
  };
}

function Counter({ value }: { value: string }) {
  const parts = splitValue(value);
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 90 });
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const target = parts?.number ?? 0;

  useEffect(() => {
    if (isInView) motionValue.set(target);
  }, [isInView, motionValue, target]);

  useEffect(() => {
    if (!parts) return;
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${parts.prefix}${Math.floor(latest).toLocaleString("en-IN")}${parts.suffix}`;
      }
    });
  }, [springValue, parts]);

  // Anything without digits (e.g. "Hand stitched") just renders as written.
  if (!parts) return <span>{value}</span>;

  return (
    <span ref={ref}>
      {parts.prefix}0{parts.suffix}
    </span>
  );
}

export default function StatsBar({ stats }: { stats: HomeStat[] }) {
  if (stats.length === 0) return null;

  return (
    <section className="border-b border-border/80 bg-band">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-10 sm:grid-cols-4 sm:gap-4 sm:py-14">
        {stats.map((stat, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <motion.div
              key={`${stat.label}-${i}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <span className="font-serif text-2xl sm:text-3xl">
                <Counter value={stat.value} />
              </span>
              <span className="text-xs uppercase tracking-[0.15em] text-muted sm:text-sm">
                {stat.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
