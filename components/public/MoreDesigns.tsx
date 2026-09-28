import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CategoryNav, { type CategoryLink } from "@/components/public/CategoryNav";
import ModelCard from "@/components/public/ModelCard";
import FadeIn from "@/components/public/FadeIn";
import type { ModelDTO } from "@/lib/types";

/**
 * Where a design page goes next.
 *
 * Until now the only way onward was the small "Back to <category>" link at the
 * very top — so anyone who had scrolled through the photographs had to scroll
 * all the way back up to carry on looking. This puts the rest of the category
 * at the foot of the page, where they already are, and the other categories
 * under that.
 *
 * It is deliberately at the end rather than another rail at the top: the page
 * is about one garment, and the alternatives belong after it, not competing
 * with it.
 */
export default function MoreDesigns({
  siblings,
  categories,
  categoryName,
  categorySlug,
  categoryCount,
  whatsapp,
  siteName,
}: {
  /** Other designs in the same category. May be empty. */
  siblings: ModelDTO[];
  categories: CategoryLink[];
  categoryName?: string | null;
  categorySlug?: string | null;
  /** How many designs the category holds in total, for the "see all" link. */
  categoryCount?: number;
  whatsapp?: string | null;
  siteName?: string;
}) {
  const hasSiblings = siblings.length > 0;
  const hasCategories = categories.length > 0;
  if (!hasSiblings && !hasCategories) return null;

  return (
    <section className="border-t border-border/80 bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        {hasSiblings && categorySlug && (
          <FadeIn>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-serif text-2xl sm:text-3xl">
                More in {categoryName}
              </h2>
              {/* Only worth offering when there is more than what is shown. */}
              {typeof categoryCount === "number" && categoryCount > siblings.length + 1 && (
                <Link
                  href={`/catalog/${categorySlug}`}
                  className="group inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                >
                  See all {categoryCount}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {siblings.map((model, i) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  index={i}
                  whatsapp={whatsapp}
                  siteName={siteName}
                />
              ))}
            </div>
          </FadeIn>
        )}

        {hasCategories && (
          <FadeIn delay={0.1} className={hasSiblings ? "mt-10 sm:mt-14" : ""}>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
              Browse another category
            </p>
            <div className="mt-4">
              <CategoryNav categories={categories} activeSlug={categorySlug ?? ""} />
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
