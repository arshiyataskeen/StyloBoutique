"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Ruler, ArrowUpRight, MessageCircle } from "lucide-react";
import { ModelDTO } from "@/lib/types";
import { isPriceHidden, priceLabel, whatsappLink } from "@/lib/pricing";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ModelCard({
  model,
  index = 0,
  whatsapp,
  siteName = "Stylo",
}: {
  model: ModelDTO;
  index?: number;
  whatsapp?: string | null;
  siteName?: string;
}) {
  const image = model.images[0];
  const hidden = isPriceHidden(model.priceDisplay);
  const askable = hidden && Boolean(whatsapp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      // Capped so a long category does not trail off into a slow drip.
      transition={{ duration: 0.5, delay: Math.min(index, 7) * 0.05, ease: EASE }}
      whileHover={{ y: -6 }}
      // The card is a div with a stretched link rather than one big anchor, so
      // the WhatsApp button can sit on top without nesting one <a> inside another.
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface transition-shadow duration-300 hover:shadow-xl hover:shadow-black/10"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {image ? (
          <motion.img
            src={image}
            alt={model.name}
            loading="lazy"
            decoding="async"
            initial={{ clipPath: "inset(12% 0% 0% 0%)", scale: 1.08 }}
            whileInView={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.65, ease: EASE }}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-gradient-to-br from-[#f6f1e8] via-[#efe6d6] to-[#e6d8c2]">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/10 blur-2xl"
            />
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/25 bg-white/70 text-accent/70">
              <Ruler className="h-6 w-6" strokeWidth={1.25} />
            </span>
            <span className="px-4 text-center text-[11px] uppercase tracking-[0.18em] text-muted/80">
              Made to measure
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute bottom-3 left-3 flex translate-y-3 items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View Details <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="font-serif text-base leading-snug transition-colors group-hover:text-accent sm:text-lg">
          {model.name}
        </h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 sm:justify-between">
          <span className={hidden ? "text-sm text-muted" : "font-medium text-accent"}>
            {priceLabel(model.price, model.priceDisplay)}
          </span>
          {!hidden && model.priceNote && (
            <span className="text-xs text-muted">{model.priceNote}</span>
          )}
        </div>

        {askable && (
          <a
            href={whatsappLink({ phone: whatsapp!, siteName, designName: model.name })}
            target="_blank"
            rel="noopener noreferrer"
            // z-20 puts it above the stretched link below.
            className="relative z-20 mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#25D366]/10 px-3 py-1.5 text-xs font-medium text-[#128C4A] transition-colors hover:bg-[#25D366]/20"
          >
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
            Ask price
          </a>
        )}
      </div>

      <Link
        href={`/models/${model.id}`}
        aria-label={model.name}
        className="absolute inset-0 z-10"
      />
    </motion.div>
  );
}
