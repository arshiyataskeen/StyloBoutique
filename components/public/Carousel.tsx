"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * A row that shows four things at a time and scrolls to the rest.
 *
 * Four is the point of it: a full grid of every category or every design at the
 * foot of a page competes with the page itself. Four reads as a suggestion.
 *
 * It scrolls rather than swapping what is in each slot. A slot that silently
 * became a different category would move the link out from under a finger
 * already on its way to tap it — fine for a photo frame, not for navigation.
 * Autoplay nudges it along so the rest is visible without anyone touching it,
 * and stops the moment a pointer, a finger or the keyboard arrives.
 */
export default function Carousel({
  children,
  /** Milliseconds between nudges. 0 disables autoplay. */
  autoPlayMs = 0,
  label,
}: {
  children: React.ReactNode;
  autoPlayMs?: number;
  label: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  // A ref, not state: pausing must not re-render mid-scroll.
  const paused = useRef(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    // Measuring happens inside the observer's callback rather than in the
    // effect body — a synchronous setState during an effect is exactly what
    // react-hooks/set-state-in-effect is there to stop.
    const measure = () => {
      const slack = el.scrollWidth - el.clientWidth;
      setOverflows(slack > 4);
      setAtStart(el.scrollLeft <= 4);
      setAtEnd(el.scrollLeft >= slack - 4);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    el.addEventListener("scroll", measure, { passive: true });

    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", measure);
    };
  }, [children]);

  /** One card plus the gap after it, read off the DOM so CSS stays the source. */
  const step = () => {
    const el = trackRef.current;
    if (!el) return 0;
    const [first, second] = Array.from(el.children) as HTMLElement[];
    if (first && second) return second.offsetLeft - first.offsetLeft;
    return first?.clientWidth ?? el.clientWidth;
  };

  const scrollByCards = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: step() * direction, behavior: "smooth" });
  };

  useEffect(() => {
    if (!autoPlayMs || !overflows) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      const el = trackRef.current;
      if (!el || paused.current) return;

      // Back to the beginning at the end, so the row keeps offering the whole
      // set rather than parking on the last four for good.
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step(), behavior: "smooth" });
      }
    }, autoPlayMs);

    return () => clearInterval(timer);
  }, [autoPlayMs, overflows]);

  return (
    <div
      className="relative"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocusCapture={() => (paused.current = true)}
      onBlurCapture={() => (paused.current = false)}
      onTouchStart={() => (paused.current = true)}
    >
      <div
        ref={trackRef}
        role="group"
        aria-label={label}
        className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:gap-4 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {/* Only worth drawing when there is somewhere to go. Hidden on touch,
          where swiping is the obvious gesture and arrows just cover a card. */}
      {overflows && (
        <>
          <ArrowButton
            side="left"
            disabled={atStart}
            onClick={() => scrollByCards(-1)}
          />
          <ArrowButton side="right" disabled={atEnd} onClick={() => scrollByCards(1)} />
        </>
      )}
    </div>
  );
}

function ArrowButton({
  side,
  disabled,
  onClick,
}: {
  side: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Previous" : "Next"}
      className={`absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-md shadow-black/5 backdrop-blur transition-all hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-0 lg:flex ${
        side === "left" ? "-left-5" : "-right-5"
      }`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

/** The width every card in a Carousel uses: four across from lg, fewer below. */
export const CAROUSEL_ITEM =
  "w-[70%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]";
