"use client";

import { useEffect, useRef, useState } from "react";
import Photo from "@/components/public/Photo";

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
  const [width, setWidth] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    // A resize subscription, so setState runs from the callback rather than
    // synchronously during the effect.
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (images.length === 0) return null;

  /**
   * How many photos go in one half of the track.
   *
   * The drift slides the track by exactly half its width, which only loops
   * seamlessly if that half is at least as wide as the frame — otherwise the
   * tail of the first half arrives before the second half has reached the far
   * edge, and the rope appears to run out with bare line beside it.
   *
   * PHOTO_SPAN is the widest a photo plus its gap gets (sm: 144px + 16px).
   */
  const PHOTO_SPAN = 160;
  const needed = Math.ceil((width || 640) / PHOTO_SPAN) + 2;
  const copies = Math.max(1, Math.ceil(needed / images.length));
  const half = Array.from({ length: copies }).flatMap(() => images);
  // Two identical halves: sliding by 50% lands exactly on the repeat.
  const run = [...half, ...half];

  return (
    <div
      ref={boxRef}
      className="relative select-none overflow-hidden pt-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* the line itself */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-3 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />

      <div
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
              className="group relative shrink-0 pt-2"
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
                  className={`relative block h-36 w-28 overflow-hidden rounded-lg border-2 bg-surface shadow-md shadow-black/10 transition-all duration-300 sm:h-44 sm:w-36 ${
                    isActive
                      ? "border-accent"
                      : "border-transparent group-hover:border-accent/50"
                  }`}
                >
                  {/* These are pegged-up thumbnails at ~144px wide — the one
                      place a genuinely small re-encode pays off most. */}
                  <Photo
                    src={url}
                    alt=""
                    fit="thumb"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
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
