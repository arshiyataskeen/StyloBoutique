"use client";

import { useEffect, useRef, useState } from "react";

const GAP = 12;
/** 4:3 portrait panels. */
const RATIO = 4 / 3;

/**
 * Fewer, larger panels on a phone: a 14-panel ring needs roughly 630px of width
 * before the sides start getting clipped, which no phone has.
 */
function panelCount(width: number) {
  if (width < 420) return 9;
  if (width < 640) return 11;
  return 14;
}

/**
 * Widest panel that still lets the whole ring fit the container.
 *
 * The ring's projected width is about twice the radius, and
 * radius = (card + gap) / (2·tan(π/n)) — so solving for the card width and
 * allowing 2% of bleed keeps the cylinder inside its column at every size.
 */
function panelWidth(width: number, count: number) {
  const fits = width * 1.02 * Math.tan(Math.PI / count) - GAP;
  return Math.max(76, Math.min(132, Math.floor(fits)));
}

/**
 * Photos wrapped around a vertical cylinder that turns continuously.
 *
 * Each panel is rotated to its own slice of the circle and pushed out by the
 * radius, so they sit on the cylinder's surface. Back faces stay visible and
 * dimmed — hiding them made the ring look like three loose cards.
 */
export default function CylinderGallery({ images }: { images: string[] }) {
  const [paused, setPaused] = useState(false);
  const [width, setWidth] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;

    // A resize subscription, so setState here runs from the callback rather
    // than synchronously during the effect.
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  if (images.length === 0) return null;

  // Fall back to a phone-sized ring for the first paint, before measuring.
  const box = width || 320;
  const count = panelCount(box);
  const cardW = panelWidth(box, count);
  const cardH = Math.round(cardW * RATIO);

  // Repeat the set so the ring is always full, however few photos exist.
  const repeats = Math.max(1, Math.ceil(count / images.length));
  const panels = Array.from({ length: repeats * images.length }, (_, i) => images[i % images.length]);

  const total = panels.length;
  const angle = 360 / total;
  const radius = Math.round((cardW + GAP) / 2 / Math.tan(Math.PI / total));

  return (
    <div
      ref={boxRef}
      className="relative w-full"
      style={{ height: cardH + 60 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="h-full" style={{ perspective: 1200, perspectiveOrigin: "50% 50%" }}>
        {/* motion-reduce:!animate-none carries !important, so it overrides the
            inline animation for visitors who prefer reduced motion. */}
        <div
          className="relative mx-auto motion-reduce:!animate-none"
          style={{
            width: cardW,
            height: cardH,
            top: 30,
            transformStyle: "preserve-3d",
            animation: "spin-y 40s linear infinite",
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {panels.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="absolute inset-0 overflow-hidden rounded-lg border border-border/70 bg-surface shadow-md shadow-black/10"
              style={{ transform: `rotateY(${i * angle}deg) translateZ(${radius}px)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
