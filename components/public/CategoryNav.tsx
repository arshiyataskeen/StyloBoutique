"use client";

import Link from "next/link";
import { ArrowUpRight, Scissors } from "lucide-react";
import Carousel, { CAROUSEL_ITEM } from "@/components/public/Carousel";
import Photo from "@/components/public/Photo";

export type CategoryLink = {
  id: string;
  name: string;
  slug: string;
  /** The category's own photo, or the first design's — may be missing. */
  cover: string | null;
};

/**
 * The other categories, at the foot of a category page.
 *
 * Photographs rather than named buttons: this is a shop, and a row of words
 * asks someone to already know what "Maggam" looks like. The picture is the
 * thing being sold. Counts are gone with them — "14" beside Blouses was a fact
 * about the database, not a reason to look.
 *
 * The category being viewed is left out entirely rather than shown greyed: it
 * is the page you are on, so offering it back is a dead end.
 */
export default function CategoryNav({
  categories,
  activeSlug,
}: {
  categories: CategoryLink[];
  activeSlug: string;
}) {
  const others = categories.filter((c) => c.slug !== activeSlug);
  if (others.length === 0) return null;

  return (
    <Carousel label="Other categories" autoPlayMs={5000}>
      {others.map((c) => (
        <Link
          key={c.id}
          href={`/catalog/${c.slug}`}
          className={`group relative overflow-hidden rounded-2xl border border-border bg-surface transition-shadow duration-300 hover:shadow-xl hover:shadow-black/10 ${CAROUSEL_ITEM}`}
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            {c.cover ? (
              <Photo
                src={c.cover}
                alt=""
                fit="tile"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f6f1e8] via-[#efe6d6] to-[#e6d8c2]">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/25 bg-white/70 text-accent/70">
                  <Scissors className="h-5 w-5" strokeWidth={1.25} />
                </span>
              </div>
            )}
            {/* The name sits on the photo, so the card stays the height of the
                picture instead of growing a caption strip underneath. */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
              <h3 className="font-serif text-lg leading-tight text-white drop-shadow-sm">
                {c.name}
              </h3>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-white/80 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </div>
        </Link>
      ))}
    </Carousel>
  );
}
