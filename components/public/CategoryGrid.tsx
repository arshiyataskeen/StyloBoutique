"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Scissors } from "lucide-react";
import Photo from "@/components/public/Photo";

const EASE = [0.22, 1, 0.36, 1] as const;

export type CategoryTile = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  count: number;
  cover: string | null;
};

export default function CategoryGrid({ categories }: { categories: CategoryTile[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          // Snappier and capped — the old 0.09s step meant the sixth tile
          // waited half a second after the first.
          transition={{ duration: 0.5, delay: Math.min(i, 5) * 0.05, ease: EASE }}
          whileHover={{ y: -6 }}
          className="h-full"
        >
          <Link
            href={`/catalog/${c.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-shadow duration-300 hover:shadow-xl hover:shadow-black/10"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              {c.cover ? (
                // The wipe lives on a wrapper now so the photo underneath can
                // be a next/image and arrive re-encoded at tile size.
                <motion.div
                  // Wipes down as it settles, matching the design cards.
                  initial={{ clipPath: "inset(0% 0% 14% 0%)", scale: 1.1 }}
                  whileInView={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, ease: EASE }}
                  className="absolute inset-0"
                >
                  <Photo
                    src={c.cover}
                    alt=""
                    fit="tile"
                    // The catalog opens on these, so the first row should not
                    // wait for the lazy loader to notice them.
                    priority={i < 3}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </motion.div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f6f1e8] via-[#efe6d6] to-[#e6d8c2]">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/25 bg-white/70 text-accent/70">
                    <Scissors className="h-6 w-6" strokeWidth={1.25} />
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>

            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-serif text-xl transition-colors group-hover:text-accent">
                  {c.name}
                </h2>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>

              {c.description && (
                <p className="mt-1.5 flex-1 text-sm text-muted">{c.description}</p>
              )}

              <p className="mt-4 text-xs uppercase tracking-[0.15em] text-accent">
                {c.count > 0
                  ? `${c.count} design${c.count === 1 ? "" : "s"}`
                  : "Coming soon"}
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
