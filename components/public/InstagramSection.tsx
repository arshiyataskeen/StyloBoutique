"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import InstagramIcon from "@/components/public/InstagramIcon";
import RevealText from "@/components/public/RevealText";
import type { InstagramAccount } from "@/lib/instagram";
import type { SectionContent } from "@/lib/types";

/**
 * The tiles are the boutique's own catalog photos, not a live Instagram feed —
 * pulling real posts needs a Meta Graph API token the shop doesn't have. The
 * copy says "from our studio" rather than "latest posts" so nothing here
 * claims to be something it isn't.
 */
export default function InstagramSection({
  account,
  images,
  content,
}: {
  account: InstagramAccount;
  images: string[];
  content: SectionContent["instagram"];
}) {
  const tiles = images.slice(0, 6);

  return (
    <section className="border-b border-border/80 bg-band">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent"
            >
              <InstagramIcon className="h-4 w-4" strokeWidth={1.75} />
              {content.eyebrow}
            </motion.p>
            <h2 className="font-serif text-2xl sm:text-3xl">
              <RevealText text={content.heading} />
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted">{content.subheading}</p>
          </div>

          <motion.a
            href={account.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ y: -2 }}
            className="group inline-flex w-fit shrink-0 items-center gap-2.5 rounded-full px-5 py-3 text-sm font-medium text-white shadow-sm"
            // Instagram's own gradient, so the button reads as the brand at a glance.
            style={{
              backgroundImage:
                "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
            }}
          >
            <InstagramIcon className="h-4 w-4" strokeWidth={2} />
            @{account.handle}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </motion.a>
        </div>

        {tiles.length > 0 && (
          <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-6">
            {tiles.map((src, i) => (
              <motion.a
                key={`${src}-${i}`}
                href={account.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="group relative aspect-square overflow-hidden rounded-xl bg-surface"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 16vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 text-white opacity-0 transition-all duration-300 group-hover:bg-foreground/35 group-hover:opacity-100">
                  <InstagramIcon className="h-6 w-6" strokeWidth={1.5} />
                </span>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
