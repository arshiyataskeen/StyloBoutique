"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import FeaturedMarquee from "@/components/public/FeaturedMarquee";
import type { CategoryDTO, ModelDTO, SectionContent } from "@/lib/types";

export default function FeaturedSection({
  categories,
  models,
  content,
}: {
  categories: CategoryDTO[];
  models: ModelDTO[];
  content: SectionContent["featured"];
}) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        {categories.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Link
              href={`/catalog/${c.slug}`}
              className="inline-block rounded-full border border-border px-4 py-2 text-sm transition-all hover:scale-105 hover:border-accent hover:text-accent"
            >
              {c.name}
            </Link>
          </motion.div>
        ))}
      </div>

      {models.length > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2"
          >
            <h2 className="font-serif text-xl sm:text-2xl">{content.heading}</h2>
            <Link
              href="/catalog"
              className="group flex items-center gap-1 text-sm text-accent hover:underline"
            >
              {content.ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
          <FeaturedMarquee models={models} />
        </>
      )}
    </section>
  );
}
