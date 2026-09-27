"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import FeedbackButton from "@/components/public/FeedbackButton";

const EASE = [0.22, 1, 0.36, 1] as const;

export type FeedbackItem = {
  id: string;
  name: string;
  message: string;
  rating: number | null;
  createdAt: string | Date;
};

export default function Testimonials({
  feedback,
  /**
   * Drops the full-width band and the "Leave feedback" button, for pages that
   * already have their own — the Contact page carries both, and repeating them
   * gave two identical buttons a screen apart.
   */
  bare = false,
  /** Hides the built-in heading, for a page whose own title already says it. */
  headless = false,
}: {
  feedback: FeedbackItem[];
  bare?: boolean;
  headless?: boolean;
}) {
  return (
    <section
      className={bare ? "" : "border-t border-border/80 bg-band py-10 sm:py-14"}
    >
      <div className={bare ? "" : "mx-auto max-w-6xl px-5"}>
        {!headless && (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Kind Words</p>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl">What our customers say</h2>
            </div>
            {!bare && <FeedbackButton />}
          </div>
        )}

        {feedback.length === 0 ? (
          <p className={`text-sm text-muted ${headless ? "" : "mt-8"}`}>
            No reviews yet — if we&apos;ve stitched something for you, we&apos;d love to hear how it turned out.
          </p>
        ) : (
          <div
            className={`grid gap-5 sm:grid-cols-2 ${headless ? "" : "mt-8"} ${
              bare ? "" : "lg:grid-cols-3"
            }`}
          >
            {feedback.map((item, i) => (
              <motion.figure
                key={item.id}
                // Cards arrive tipped slightly forward and settle upright, like
                // a card being laid down — staggered, and capped so a long list
                // does not trail off into a slow drip.
                initial={{ opacity: 0, y: 26, rotateX: -12 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: Math.min(i, 8) * 0.08, ease: EASE }}
                whileHover={{ y: -5 }}
                style={{ transformPerspective: 900 }}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-shadow duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-black/5"
              >
                {/* An oversized quote mark bleeding off the corner, so a wall
                    of cards reads as quotes rather than as boxes of text. */}
                <Quote
                  aria-hidden
                  className="pointer-events-none absolute -right-3 -top-2 h-20 w-20 text-accent/[0.07] transition-colors duration-300 group-hover:text-accent/[0.12]"
                  strokeWidth={1.5}
                  fill="currentColor"
                />

                {item.rating && (
                  <div className="flex gap-0.5" aria-label={`${item.rating} out of 5`}>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <motion.span
                        key={s}
                        // Stars fill one after another, left to right.
                        initial={{ opacity: 0, scale: 0.4 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.3,
                          delay: Math.min(i, 8) * 0.08 + 0.25 + s * 0.06,
                          ease: EASE,
                        }}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            s < item.rating! ? "text-accent" : "text-border"
                          }`}
                          fill="currentColor"
                        />
                      </motion.span>
                    ))}
                  </div>
                )}

                <blockquote className="relative mt-3 flex-1 text-sm leading-relaxed text-foreground/80">
                  {item.message}
                </blockquote>

                <figcaption className="relative mt-4 flex items-center gap-2.5 border-t border-border/70 pt-3">
                  {/* Initial in a ring — a face for the name without a photo. */}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 font-serif text-sm text-accent">
                    {item.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="text-xs uppercase tracking-[0.15em] text-muted">
                    {item.name}
                  </span>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
