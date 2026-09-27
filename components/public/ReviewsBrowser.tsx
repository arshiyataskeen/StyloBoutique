"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Testimonials, { type FeedbackItem } from "@/components/public/Testimonials";
import FeedbackButton from "@/components/public/FeedbackButton";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The reviews, with a summary and a rating filter.
 *
 * A plain list answers "what did someone say"; a visitor deciding whether to
 * order wants "what do people generally say, and what do the unhappy ones
 * complain about". The breakdown answers the first and the filter the second —
 * including the one-star filter, which is the one people look for.
 */
export default function ReviewsBrowser({ feedback }: { feedback: FeedbackItem[] }) {
  const [only, setOnly] = useState<number | null>(null);

  const rated = feedback.filter((f) => typeof f.rating === "number");
  const average =
    rated.length > 0 ? rated.reduce((sum, f) => sum + (f.rating ?? 0), 0) / rated.length : null;

  // Counts per star, 5 down to 1.
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: rated.filter((f) => f.rating === star).length,
  }));
  const most = Math.max(1, ...counts.map((c) => c.count));

  const shown = only === null ? feedback : feedback.filter((f) => f.rating === only);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="grid gap-6 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:p-6"
      >
        {/* the headline number */}
        <div className="flex flex-row items-center gap-4 sm:flex-col sm:items-start sm:gap-2 sm:border-r sm:border-border sm:pr-8">
          <span className="font-serif text-5xl leading-none text-accent">
            {average !== null ? average.toFixed(1) : "—"}
          </span>
          <div>
            <span className="flex gap-0.5" aria-label={average ? `${average.toFixed(1)} out of 5` : undefined}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    average !== null && i < Math.round(average) ? "text-accent" : "text-border"
                  }`}
                  fill="currentColor"
                />
              ))}
            </span>
            <p className="mt-1 text-xs text-muted">
              {feedback.length} {feedback.length === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>

        {/* one bar per star */}
        <div className="space-y-1.5">
          {counts.map(({ star, count }) => (
            <button
              key={star}
              type="button"
              onClick={() => setOnly(only === star ? null : star)}
              disabled={count === 0}
              aria-pressed={only === star}
              className={`flex w-full items-center gap-3 rounded-lg px-2 py-1 text-left transition-colors ${
                count === 0
                  ? "cursor-default opacity-40"
                  : only === star
                    ? "bg-accent/10"
                    : "hover:bg-background"
              }`}
            >
              <span className="flex w-10 shrink-0 items-center gap-1 text-xs tabular-nums text-muted">
                {star}
                <Star className="h-3 w-3 text-accent" fill="currentColor" />
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-background">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / most) * 100}%` }}
                  transition={{ duration: 0.7, delay: 0.15 + (5 - star) * 0.06, ease: EASE }}
                  className="block h-full rounded-full bg-accent/70"
                />
              </span>
              <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted">
                {count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <FilterPill label="All ratings" active={only === null} onClick={() => setOnly(null)} />
          {counts
            .filter((c) => c.count > 0)
            .map(({ star, count }) => (
              <FilterPill
                key={star}
                label={`${star} ★`}
                count={count}
                active={only === star}
                onClick={() => setOnly(only === star ? null : star)}
              />
            ))}
        </div>

        <FeedbackButton />
      </div>

      <div className="mt-6">
        {shown.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-surface px-6 py-10 text-center text-sm text-muted">
            No {only}-star reviews yet.{" "}
            <button
              type="button"
              onClick={() => setOnly(null)}
              className="text-accent hover:underline"
            >
              Show all
            </button>
          </p>
        ) : (
          // key on the filter so the cards replay their entrance when it changes
          <Testimonials key={only ?? "all"} feedback={shown} bare headless />
        )}
      </div>
    </div>
  );
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-surface text-foreground/75 hover:border-accent hover:text-accent"
      }`}
    >
      {label}
      {typeof count === "number" && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
            active ? "bg-accent/15 text-accent" : "bg-background text-muted"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
