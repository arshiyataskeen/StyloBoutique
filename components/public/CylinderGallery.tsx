"use client";

import { useEffect, useRef, useState } from "react";

const GAP = 12;

/**
 * The helix is wound twice rather than once.
 *
 * With a single turn, the panels the viewer can see are always a run of
 * consecutive ones — and since each is lifted a little above the last, their
 * heights are consecutive too. The result is a clump of photos at one end of
 * the frame and nothing at the other, with the rest of the spiral hidden round
 * the back.
 *
 * Two turns means the near face shows panels from both, so what you see is
 * spread down the whole height at every moment of the rotation.
 */
const TURNS = 2;

/**
 * Distinct angular positions around the axis. The panel count is this times
 * TURNS, and this — not the panel count — is what sets the radius, because
 * panels one turn apart sit at the same angle.
 */
function positionsAround(width: number) {
  if (width < 420) return 5;
  if (width < 640) return 6;
  return 7;
}

/**
 * Widest panel that still lets the whole turn fit inside the container.
 *
 * The widest point is a panel turned side-on: its centre sits one radius from
 * the middle, and half its own width reaches further still. So the constraint
 * is `radius + card/2 <= width/2` — getting that wrong is what let panels
 * spill out of the column and overlap the photo beside it.
 *
 * With radius = (card + gap) / (2·tan(π/n)), solving for the card width gives:
 */
function panelWidth(width: number, count: number) {
  const t = Math.tan(Math.PI / count);
  const fits = (width / 2 - GAP / (2 * t)) / (1 / (2 * t) + 0.5);
  return Math.max(64, Math.min(280, Math.floor(fits)));
}

/**
 * Photos wound around a vertical axis as a helix.
 *
 * A plain ring put every photo at the same height, which left the tall column
 * it sits in mostly empty — the panel width is capped by the turn having to
 * fit the column, and a panel's height follows the photo's shape, so the ring
 * could never be more than a shallow band.
 *
 * Winding the same panels into a spiral uses the height instead of fighting
 * it: each one is lifted a little further than the last, so the set sweeps
 * from the bottom of the frame to the top as it turns. Panels whose backs are
 * turned stay hidden, so only the near face of the spiral is ever visible.
 */
export default function CylinderGallery({ images }: { images: string[] }) {
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

  // Fall back to a phone-sized turn for the first paint, before measuring.
  const width = box.width || 320;
  const height = box.height || width * 1.25;
  const around = positionsAround(width);
  const count = around * TURNS;
  // Sized from the angular positions, not the panel count: two panels a turn
  // apart occupy the same slice of the circle, so they do not each need room.
  const cardW = panelWidth(width, around);
  // Roughly 3:4, which is what the shop's photos are. Since the images are
  // contained rather than cropped, a panel far from their own shape would just
  // be empty space around a small picture.
  const cardH = Math.round(cardW * 1.34);

  // How far the spiral climbs, top panel to bottom. Whatever the frame has
  // left once a panel and a little clearance are accounted for.
  const climb = Math.max(0, height - cardH - 24);

  const panels = Array.from({ length: count }, (_, i) => images[i % images.length]);
  // Two full turns across the whole set, so consecutive panels are a wide step
  // apart around the axis as well as a small step up it.
  const angle = (360 * TURNS) / count;
  const radius = Math.round((cardW + GAP) / 2 / Math.tan(Math.PI / around));

  return (
    <div
      ref={boxRef}
      // overflow-hidden is the safety net: the maths above should keep every
      // panel inside, but a panel must never be able to reach the column next
      // to it, whatever the width works out to.
      className="relative aspect-[4/5] w-full overflow-hidden"
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: 1400, perspectiveOrigin: "50% 50%" }}
      >
        {/* motion-reduce:!animate-none carries !important, so it overrides the
            inline animation for visitors who prefer reduced motion. */}
        <div
          className="relative motion-reduce:!animate-none"
          style={{
            width: cardW,
            height: cardH,
            transformStyle: "preserve-3d",
            animation: "spin-y 44s linear infinite",
          }}
        >
          {panels.map((url, i) => {
            // Evenly spaced up the climb, centred on the frame.
            const lift = climb * (i / Math.max(1, count - 1)) - climb / 2;
            return (
              <div
                key={`${url}-${i}`}
                className="absolute inset-0 overflow-hidden rounded-lg border border-border/70 bg-surface shadow-lg shadow-black/10"
                style={{
                  // translateY first, so the lift is vertical in the frame
                  // rather than along the panel's own tilted axis.
                  transform: `translateY(${lift}px) rotateY(${i * angle}deg) translateZ(${radius}px)`,
                  // Hides a panel once it has turned past edge-on, so the far
                  // side never shows through as a mirrored image.
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                {/* The same photo, enlarged and blurred, behind the real one.
                    A contained photo leaves bare strips wherever its shape
                    differs from the panel — square shots in a 3:4 panel left a
                    white band top and bottom. This fills them with the photo's
                    own colours, so nothing is cropped and no gap shows. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full scale-110 object-cover blur-lg"
                />
                {/* contain, not cover: the shop's photos carry a logo in one
                    corner, and cropping to fill the panel sliced it in half. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
