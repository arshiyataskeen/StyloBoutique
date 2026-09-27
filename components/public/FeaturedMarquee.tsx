"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Ruler, ArrowUpRight } from "lucide-react";
import type { ModelDTO } from "@/lib/types";

/** Enough cards per half that the track always overflows a wide screen. */
const MIN_PER_HALF = 8;
/** Pixels per second — slow enough to read a card as it passes. */
const SPEED = 38;

function Card({ model }: { model: ModelDTO }) {
  const image = model.images[0];

  return (
    <Link
      href={`/models/${model.id}`}
      className="group block w-56 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface transition-shadow duration-300 hover:shadow-xl hover:shadow-black/10 sm:w-64"
    >
      {/* A fixed 4:5 so every card is the same size in the row, with the photo
          contained inside it rather than cropped to fill. */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {image ? (
          <>
            {/* The same photo, enlarged and blurred, filling whatever the
                contained one leaves bare. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={model.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#f6f1e8] via-[#efe6d6] to-[#e6d8c2]">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/25 bg-white/70 text-accent/70">
              <Ruler className="h-6 w-6" strokeWidth={1.25} />
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted/80">
              Made to measure
            </span>
          </div>
        )}
        <span className="absolute bottom-3 left-3 flex translate-y-3 items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View Details <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>

      {/*
        No price here. The homepage is a shop window, and most designs are set
        to "ask instead" anyway — this row was printing formatPrice(0) and
        showing every card as ₹0, which reads as free rather than as unpriced.
        The category name is the useful line in its place.
      */}
      <div className="p-4">
        <p className="truncate text-[11px] uppercase tracking-[0.18em] text-accent">
          {typeof model.category === "string" ? "Made to measure" : model.category.name}
        </p>
        <h3 className="mt-1 truncate font-serif text-lg leading-snug transition-colors group-hover:text-accent">
          {model.name}
        </h3>
      </div>
    </Link>
  );
}

export default function FeaturedMarquee({ models }: { models: ModelDTO[] }) {
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

      const dt = Math.min(now - last, 64);
      last = now;

      // Hovering pauses it, so you can stop and look without a button.
      if (!hovering.current) track.scrollLeft += (SPEED * dt) / 1000;

      // The track is two identical halves, so wrapping at the midpoint is invisible.
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

  if (models.length === 0) return null;

  const repeats = Math.max(1, Math.ceil(MIN_PER_HALF / models.length));
  const half = Array.from({ length: repeats }).flatMap(() => models);

  return (
    <div
      className="relative -mx-5"
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
    >
      <div
        ref={trackRef}
        // Touch has no hover, so the same pause has to come from the pointer
        // itself — otherwise the auto-scroll fights the finger mid-swipe. The
        // delay on release stops it snatching the track back immediately.
        onPointerDown={() => (hovering.current = true)}
        onPointerUp={resumeSoon}
        onPointerCancel={resumeSoon}
        className="no-scrollbar touch-pan-x overflow-x-auto overscroll-x-contain"
        // fade the edges so cards slide in and out rather than getting chopped
        style={{
          maskImage:
            "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
        }}
      >
        <div className="flex w-max gap-4 px-5">
          {[...half, ...half].map((model, i) => (
            <Card key={`${model.id}-${i}`} model={model} />
          ))}
        </div>
      </div>

    </div>
  );
}
