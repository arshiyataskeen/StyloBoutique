"use client";

import { Children, useEffect, useRef } from "react";

/** Enough cards per half that the track always overflows a wide screen. */
const MIN_PER_HALF = 8;
/**
 * Pixels per second. Deliberately gentler than the homepage row's 38: that one
 * is a shop window you glance at on the way in, while these sit at the foot of
 * a page you are already reading, and want to be looked at rather than watched.
 */
const SPEED = 26;
/** The width every card gets — the homepage row's, so the two rows match. */
const ITEM = "w-56 shrink-0 sm:w-64";

/**
 * A row that slides past on its own, the same way the homepage's featured row
 * does.
 *
 * This replaced a snap carousel with arrow buttons. The arrows had to sit
 * somewhere, and at four-across they landed on top of the last card — covering
 * the thing they were meant to help you reach. A row that simply keeps moving
 * needs no chrome at all: everything comes past if you wait, and a swipe or a
 * trackpad gets you there sooner.
 *
 * The track carries the set twice over and wraps at the midpoint, so the loop
 * has no seam. Hovering stops it, so you can read a card without chasing it.
 */
export default function Carousel({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let last = performance.now();

    function step(now: number) {
      const track = trackRef.current;
      if (!track) return;

      // Capped, so a backgrounded tab does not return and jump the row forward
      // by however many seconds it was away.
      const dt = Math.min(now - last, 64);
      last = now;

      if (!hovering.current) track.scrollLeft += (SPEED * dt) / 1000;

      // Two identical halves, so wrapping at the midpoint is invisible.
      const half = track.scrollWidth / 2;
      if (half > 0) {
        if (track.scrollLeft >= half) track.scrollLeft -= half;
        else if (track.scrollLeft < 0) track.scrollLeft += half;
      }

      frame = requestAnimationFrame(step);
    }

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  function resumeSoon() {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => (hovering.current = false), 2000);
  }

  const items = Children.toArray(children);
  if (items.length === 0) return null;

  // Short sets are repeated until the track is wide enough to scroll at all —
  // six categories would otherwise fit on screen and never move.
  const repeats = Math.max(1, Math.ceil(MIN_PER_HALF / items.length));
  const half = Array.from({ length: repeats }).flatMap(() => items);

  return (
    <div
      className="relative -mx-5"
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
    >
      <div
        ref={trackRef}
        role="group"
        aria-label={label}
        // Touch has no hover, so the same pause has to come from the pointer
        // itself — otherwise the auto-scroll fights the finger mid-swipe. The
        // delay on release stops it snatching the track back immediately.
        onPointerDown={() => (hovering.current = true)}
        onPointerUp={resumeSoon}
        onPointerCancel={resumeSoon}
        className="no-scrollbar touch-pan-x overflow-x-auto overscroll-x-contain"
        // Fade the edges so cards slide in and out rather than getting chopped.
        style={{
          maskImage:
            "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
        }}
      >
        {/* items-start, not the flex default of stretch: otherwise every card
            is pulled to the height of the tallest, and one cover that has not
            measured yet leaves white space under all the others. */}
        <div className="flex w-max items-start gap-4 px-5">
          {[...half, ...half].map((child, i) => (
            <div key={i} className={ITEM}>
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
