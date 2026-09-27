"use client";

import { motion } from "framer-motion";
import { Angry, Frown, Meh, Smile, Laugh } from "lucide-react";

/**
 * The 1–5 rating scale, as faces.
 *
 * Shared by the public feedback form and the admin's own "add a review" form,
 * so a rating means the same thing and looks the same wherever it is given.
 * Stored as the number a star rating would be, so nothing downstream changed.
 */
export const FACES = [
  { value: 1, Icon: Angry, label: "Not happy" },
  { value: 2, Icon: Frown, label: "Could be better" },
  { value: 3, Icon: Meh, label: "Fine" },
  { value: 4, Icon: Smile, label: "Happy" },
  { value: 5, Icon: Laugh, label: "Delighted" },
] as const;

export const labelForRating = (rating: number | null | undefined) =>
  FACES.find((f) => f.value === rating)?.label ?? "";

export default function RatingFaces({
  value,
  onChange,
  className = "",
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) {
  return (
    <div className={`flex gap-1.5 ${className}`}>
      {FACES.map(({ value: score, Icon, label }) => {
        const picked = value === score;
        return (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            aria-label={label}
            aria-pressed={picked}
            className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-2.5 transition-all ${
              picked
                ? "border-accent bg-accent/10"
                : "border-transparent hover:border-border hover:bg-background"
            }`}
          >
            <motion.span
              animate={picked ? { scale: 1.2, y: -2 } : { scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 18 }}
            >
              <Icon
                className={`h-7 w-7 transition-colors ${
                  picked ? "text-accent" : "text-muted/60"
                }`}
                strokeWidth={1.75}
              />
            </motion.span>
            <span
              className={`text-[10px] leading-tight transition-colors ${
                picked ? "font-medium text-accent" : "text-muted"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
