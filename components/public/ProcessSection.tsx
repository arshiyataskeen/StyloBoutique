"use client";

import { motion } from "framer-motion";
import { MessageSquare, Ruler, Scissors, PackageCheck, type LucideIcon } from "lucide-react";
import RevealText from "@/components/public/RevealText";
import type { SectionContent } from "@/lib/types";

/** Icons are fixed to the four stages — only the wording is editable. */
const ICONS: LucideIcon[] = [MessageSquare, Ruler, Scissors, PackageCheck];

export default function ProcessSection({ content }: { content: SectionContent["process"] }) {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-surface">
      <div className="relative mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-2 text-xs uppercase tracking-[0.2em] text-accent"
        >
          {content.eyebrow}
        </motion.p>
        <h2 className="font-serif text-2xl sm:text-3xl">
          <RevealText text={content.heading} />
        </h2>

        <div className="relative mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[22px] hidden h-px bg-border lg:block"
          />

          {content.steps.map((step, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
            <motion.div
              key={`${step.title}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative flex flex-col items-start"
            >
              <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-accent/30 bg-background text-accent">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <span className="mt-3 text-xs uppercase tracking-[0.15em] text-muted">Step {i + 1}</span>
              <h3 className="mt-1 font-serif text-lg">{step.title}</h3>
              <p className="mt-1 text-sm text-muted">{step.description}</p>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
