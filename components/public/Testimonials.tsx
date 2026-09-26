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
}: {
  feedback: FeedbackItem[];
  bare?: boolean;
}) {
  return (
    <section
      className={bare ? "" : "border-t border-border/80 bg-band py-10 sm:py-14"}
    >
      <div className={bare ? "" : "mx-auto max-w-6xl px-5"}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent">Kind Words</p>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl">What our customers say</h2>
          </div>
          {!bare && <FeedbackButton />}
        </div>

        {feedback.length === 0 ? (
          <p className="mt-8 text-sm text-muted">
            No reviews yet — if we&apos;ve stitched something for you, we&apos;d love to hear how it turned out.
          </p>
        ) : (
          <div
            className={`mt-8 grid gap-5 sm:grid-cols-2 ${bare ? "" : "lg:grid-cols-3"}`}
          >
            {feedback.map((item, i) => (
              <motion.figure
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5"
              >
                <Quote className="h-5 w-5 shrink-0 text-accent/40" strokeWidth={1.5} />

                {item.rating && (
                  <div className="mt-3 flex gap-0.5" aria-label={`${item.rating} out of 5`}>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${
                          s < item.rating! ? "text-accent" : "text-border"
                        }`}
                        fill="currentColor"
                      />
                    ))}
                  </div>
                )}

                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/80">
                  {item.message}
                </blockquote>

                <figcaption className="mt-4 text-xs uppercase tracking-[0.15em] text-muted">
                  {item.name}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
