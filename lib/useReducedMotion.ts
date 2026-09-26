"use client";

import { useEffect, useState } from "react";

/**
 * Same check used inline in SmoothScroll / FeaturedMarquee / GalleryCollage,
 * lifted into a hook for components that need it reactively (e.g. to stop an
 * infinite framer-motion loop, which the global CSS reduced-motion override
 * can't reach since it only shortens CSS animations/transitions).
 */
function getInitial() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(getInitial);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}
