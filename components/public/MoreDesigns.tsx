import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Carousel from "@/components/public/Carousel";
import ModelCard from "@/components/public/ModelCard";
import FadeIn from "@/components/public/FadeIn";
import type { ModelDTO } from "@/lib/types";

/**
 * Where a design page goes next: the rest of its own category, and nothing
 * else.
 *
 * Until now the only way onward was the small "Back to <category>" link at the
 * very top — so anyone who had scrolled through the photographs had to scroll
 * all the way back up to carry on looking. This puts the sibling designs at the
 * foot of the page, where they already are.
 *
 * Deliberately no category list here. A page about one garment offering every
 * other kind of garment is a change of subject; the categories belong on the
 * page that lists a category, which is where the visitor is heading anyway.
 */
export default function MoreDesigns({
  siblings,
  categoryName,
  categorySlug,
  categoryCount,
  whatsapp,
  siteName,
}: {
  /** Other designs in the same category. */
  siblings: ModelDTO[];
  categoryName?: string | null;
  categorySlug?: string | null;
  /** How many designs the category holds in total, for the "see all" link. */
  categoryCount?: number;
  whatsapp?: string | null;
  siteName?: string;
}) {
  if (siblings.length === 0 || !categorySlug) return null;

  return (
    <section className="border-t border-border/80 bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        <FadeIn>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-serif text-2xl sm:text-3xl">More in {categoryName}</h2>
            {/* Only worth offering when there is more than the row can hold. */}
            {typeof categoryCount === "number" && categoryCount > siblings.length + 1 && (
              <Link
                href={`/catalog/${categorySlug}`}
                className="group inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
              >
                See all
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>

          <div className="mt-5 sm:mt-6">
            {/* Slides on its own, the same as the homepage row — no arrows to
                land on top of the last card. */}
            <Carousel label={`More in ${categoryName ?? "this category"}`}>
              {siblings.map((model, i) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  index={i}
                  whatsapp={whatsapp}
                  siteName={siteName}
                />
              ))}
            </Carousel>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
