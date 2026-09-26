"use client";

import { useEffect, useRef, useState } from "react";

const GAP = 12;

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
 * Widest panel that still lets the whole ring fit inside the container.
 *
 * The widest point of the drum is a panel turned side-on: its centre sits one
 * radius from the middle, and half its own width reaches further still. So the
 * real constraint is `radius + card/2 <= width/2`, not `2·radius <= width` —
 * getting that wrong is what let panels spill out of the column and overlap
 * the photo beside it.
 *
 * With radius = (card + gap) / (2·tan(π/n)), solving for the card width gives:
 */
function panelWidth(width: number, count: number) {
  const t = Math.tan(Math.PI / count);
  const fits = (width / 2 - GAP / (2 * t)) / (1 / (2 * t) + 0.5);
  return Math.max(64, Math.min(150, Math.floor(fits)));
}

/**
 * Photos wrapped around a vertical cylinder that turns continuously.
 *
 * Each panel is rotated to its own slice of the circle and pushed out by the
 * radius, so they sit on the cylinder's surface. Panels whose backs are turned
 * are hidden rather than shown mirrored, so only the front face of the drum is
 * ever visible — which is what makes it read as a solid object rather than a
 * ring of floating cards.
 *
 * The box matches the aspect of the still frame beside it, so the two halves of
 * the gallery are the same height.
 */
export default function CylinderGallery({ images }: { images: string[] }) {
  const [paused, setPaused] = useState(false);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;

    // A resize subscription, so setState here runs from the callback rather
    // than synchronously during the effect.
    const observer = new ResizeObserver(([entry]) => {
      setBox({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  if (images.length === 0) return null;

  // Fall back to a phone-sized ring for the first paint, before measuring.
  const width = box.width || 320;
  const height = box.height || width * 1.25;
  const count = panelCount(width);
  const cardW = panelWidth(width, count);
  // Roughly 3:4, which is what the shop's photos are. Since the images are
  // contained rather than cropped, a panel far from their own shape would just
  // be empty space around a small picture.
  const cardH = Math.round(Math.min(height * 0.62, cardW * 1.34));

  // Repeat the set so the ring is always full, however few photos exist.
  const panels = Array.from({ length: count }, (_, i) => images[i % images.length]);
  const angle = 360 / count;
  const radius = Math.round((cardW + GAP) / 2 / Math.tan(Math.PI / count));

  return (
    <div
      ref={boxRef}
      // overflow-hidden is the safety net: the maths above should keep every
      // panel inside, but a panel must never be able to reach the column next
      // to it, whatever the width works out to.
      className="relative aspect-[4/5] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: 1200, perspectiveOrigin: "50% 50%" }}
      >
        {/* motion-reduce:!animate-none carries !important, so it overrides the
            inline animation for visitors who prefer reduced motion. */}
        <div
          className="relative motion-reduce:!animate-none"
          style={{
            width: cardW,
            height: cardH,
            transformStyle: "preserve-3d",
            animation: "spin-y 40s linear infinite",
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {panels.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="absolute inset-0 overflow-hidden rounded-lg border border-border/70 bg-surface shadow-md shadow-black/10"
              style={{
                transform: `rotateY(${i * angle}deg) translateZ(${radius}px)`,
                // Hides a panel once it has turned past edge-on, so the far
                // side of the drum never shows through as a mirrored image.
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {/* contain, not cover: the shop's photos carry a logo in one
                  corner, and cropping to fill the panel sliced it in half. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
