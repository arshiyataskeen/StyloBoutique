"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export type CategoryLink = { id: string; name: string; slug: string; count: number };

/**
 * The other categories, on a category page.
 *
 * Browsing used to be a round trip: open Blouses, go back to the catalog, open
 * Suits. This puts every category one tap away from wherever you already are,
 * which is how a rail of shelves works in the shop itself.
 *
 * It scrolls sideways on a phone rather than wrapping to three rows, and the
 * current category is scrolled into view on load — otherwise "Kids Wear", last
 * in the list, would be off-screen on the very page it belongs to.
 */
export default function CategoryNav({
  categories,
  activeSlug,
}: {
  categories: CategoryLink[];
  activeSlug: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    const active = activeRef.current;
    if (!rail || !active) return;

    // scrollLeft is set directly rather than calling scrollIntoView, which
    // scrolls every scrollable ancestor — including the window. This rail sits
    // at the foot of the page, so that would drop the visitor straight to the
    // footer on load. Setting scrollLeft moves the rail and nothing else.
    rail.scrollLeft = active.offsetLeft - (rail.clientWidth - active.clientWidth) / 2;
  }, [activeSlug]);

  return (
    <nav aria-label="Categories" className="relative">
      {/*
        The rail bleeds to both edges on a phone so a half-visible pill signals
        there is more to scroll, but its content still lines up with the grid
        below. Hence the negative margin and the matching padding.
      */}
      <div
        ref={railRef}
        className="-mx-5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0"
      >
        <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          <Link
            href="/catalog"
            className="shrink-0 rounded-full border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
          >
            All categories
          </Link>

          {categories.map((c) => {
            const isActive = c.slug === activeSlug;
            return (
              <Link
                key={c.id}
                ref={isActive ? activeRef : undefined}
                href={`/catalog/${c.slug}`}
                aria-current={isActive ? "page" : undefined}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-foreground/80 hover:border-accent hover:text-accent"
                }`}
              >
                {c.name}
                <span className={isActive ? "ml-1.5 text-background/60" : "ml-1.5 text-muted"}>
                  {c.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
