"use client";

import Image from "next/image";
import type { CSSProperties, SyntheticEvent } from "react";

/**
 * Every studio photograph on the public site goes through here.
 *
 * The photographs are ~2MB PNGs at 1536x1024 — the size a camera produces and
 * the format the design tool exported. Dropped straight into an <img>, a
 * category page pulled 23MB down the wire to fill cards about 300px wide, which
 * is what "the pictures are loading very lately" actually was. next/image
 * re-encodes each one to AVIF at the width it is displayed at and caches the
 * result, so the same page costs a fraction of that.
 *
 * It always fills its parent, so every caller has to give that parent a size
 * (an aspect-ratio or fixed height) and `position: relative`. That is already
 * how the cards were built.
 *
 * `sizes` is not optional in practice: without it the browser assumes the image
 * spans the viewport and downloads a far larger file than the card can show.
 * The presets below name the layouts this site actually uses, so the choice is
 * made once per layout instead of being re-derived — and wrong — at each call.
 */
const SIZES = {
  /** Design cards: 2 columns on a phone, 3 from sm, 4 from lg inside max-w-6xl. */
  card: "(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw",
  /** Category tiles: 1 column, 2 from sm, 3 from lg inside max-w-6xl. */
  tile: "(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw",
  /** Page banners and anything else edge to edge. */
  full: "100vw",
  /** The design page's main photo — a little over half the width at desktop. */
  detail: "(min-width: 1024px) 620px, 100vw",
  /** Thumbnail strips and small decorative photos. */
  thumb: "160px",
} as const;

export type PhotoFit = keyof typeof SIZES;

export default function Photo({
  src,
  alt,
  fit = "card",
  className = "",
  style,
  priority = false,
  quality,
  onLoad,
  onClick,
  draggable,
}: {
  src: string;
  alt: string;
  /** Which layout this photo sits in — picks the `sizes` hint. */
  fit?: PhotoFit;
  className?: string;
  style?: CSSProperties;
  /** Above the fold: skips lazy loading so it is not the last thing to appear. */
  priority?: boolean;
  quality?: number;
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
  onClick?: () => void;
  draggable?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={SIZES[fit]}
      priority={priority}
      // Everything below the fold stays lazy; `priority` already implies eager.
      loading={priority ? undefined : "lazy"}
      quality={quality}
      onLoad={onLoad}
      onClick={onClick}
      draggable={draggable}
      className={className}
      style={style}
    />
  );
}
