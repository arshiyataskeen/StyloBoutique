"use client";

import { useRef, useState } from "react";

/**
 * The other views of a design, pegged to a line and drifting past.
 *
 * This sits under the main photo, in the space the details column leaves
 * empty. A plain grid was fine but static, and put the views on the far side
 * of the page from the picture they belong to.
 *
 * The track carries the set twice over and slides exactly half its width, so
 * the loop has no seam. Everything moves by transform alone — this page is
 * scrolled while the animation runs, and anything that triggers layout here is
 * felt immediately.
 */
export default function PhotoRope({
  images,
  activeIndex,
  onPick,
}: {
  /** Photos to hang, in order. */
  images: string[];
  /** Index into the design's full image array of the one on show. */
  activeIndex: number;
  /** Called with that same index when a photo is picked. */
  onPick: (index: number) => void;
}) {
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) return null;

  // Enough pegs that the line is full even for a design with two photos.
  const repeats = Math.max(2, Math.ceil(8 / images.length));
  const run = Array.from({ length: repeats }).flatMap(() => images);

  return (
    <div
      className="relative select-none overflow-hidden pt-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* the line itself */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-5 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />

      <div
        ref={trackRef}
        className="flex w-max gap-4 motion-reduce:!animate-none"
        style={{
          animation: "rope-drift 38s linear infinite",
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {run.map((url, i) => {
          const realIndex = images.indexOf(url) + 1;
          const isActive = realIndex === activeIndex;
          return (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => onPick(realIndex)}
              aria-label={`View photo ${realIndex}`}
              className="group relative shrink-0 pt-3"
              style={{ transformOrigin: "50% 0%" }}
            >
              {/* the peg */}
              <span
                aria-hidden
                className={`absolute left-1/2 top-0 h-3.5 w-1.5 -translate-x-1/2 rounded-full transition-colors ${
                  isActive ? "bg-accent" : "bg-muted/50 group-hover:bg-accent/70"
                }`}
              />
              <span
                className="block motion-reduce:!animate-none"
                style={{
                  transformOrigin: "50% 0%",
                  // Prime numbers-ish, so the swings drift out of step rather
                  // than resynchronising every few seconds.
                  animation: `rope-sway ${3.1 + (i % 4) * 0.7}s ease-in-out ${(i % 5) * 0.4}s infinite`,
                }}
              >
                <span
                  className={`block h-24 w-20 overflow-hidden rounded-lg border-2 bg-surface shadow-md shadow-black/10 transition-all duration-300 sm:h-28 sm:w-24 ${
                    isActive
                      ? "border-accent"
                      : "border-transparent group-hover:border-accent/50"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
