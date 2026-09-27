"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import FeedbackButton from "@/components/public/FeedbackButton";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * How far this note hangs off true, in degrees.
 *
 * Derived from the position so it is identical on the server and in the
 * browser — Math.random here would render one angle on the server, a different
 * one on hydration, and React would flag the mismatch. Repeats every five, at
 * angles small enough to read as hand-pinned rather than careless.
 */
const TILTS = [-1.8, 1.2, -0.9, 2.0, -1.4];
const tiltOf = (index: number) => TILTS[index % TILTS.length];

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
            // A touch more room than a flat grid needs: a tilted note reaches
            // past its own box at the corners.
            className={`grid gap-6 sm:grid-cols-2 sm:gap-7 ${headless ? "" : "mt-8"} ${
              bare ? "" : "lg:grid-cols-3"
            }`}
          >
            {feedback.map((item, i) => (
              <motion.figure
                key={item.id}
                /*
                  Notes pinned to a board rather than cells in a table.
                  Each one hangs at a slightly different angle and swings
                  upright as it is pinned, then straightens when you hover it.

                  The tilt comes from the index, not Math.random — a random
                  angle would differ between the server render and the browser
                  and React would report a hydration mismatch.
                */
                initial={{ opacity: 0, y: 30, rotate: tiltOf(i) * 2.5 }}
                whileInView={{ opacity: 1, y: 0, rotate: tiltOf(i) }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  type: "spring",
                  stiffness: 140,
                  damping: 14,
                  delay: Math.min(i, 8) * 0.09,
                }}
                whileHover={{ rotate: 0, y: -6, scale: 1.02 }}
                className="group relative flex h-full flex-col rounded-lg border border-border bg-surface p-5 pt-7 shadow-[0_2px_10px_rgba(32,28,24,0.06)] transition-shadow duration-300 hover:shadow-[0_10px_28px_rgba(32,28,24,0.12)]"
              >
                {/* The pin holding it up. */}
                <span
                  aria-hidden
                  className="absolute left-1/2 top-2.5 -translate-x-1/2"
                >
                  <span className="block h-2.5 w-2.5 rounded-full bg-accent shadow-[0_1px_3px_rgba(32,28,24,0.35)]" />
                  <span className="mx-auto block h-1 w-0.5 bg-accent/40" />
                </span>

                {/* A soft quote mark behind the text, kept faint so it reads as
                    paper rather than as decoration competing with the words. */}
                <Quote
                  aria-hidden
                  className="pointer-events-none absolute -right-2 bottom-2 h-16 w-16 text-accent/[0.06] transition-colors duration-300 group-hover:text-accent/[0.10]"
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
                          delay: Math.min(i, 8) * 0.09 + 0.3 + s * 0.06,
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
