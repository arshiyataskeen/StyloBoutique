"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Mail } from "lucide-react";
import { whatsappLink } from "@/lib/pricing";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Shown in place of a figure when a design's price is hidden.
 *
 * WhatsApp leads because that is how enquiries actually arrive for a shop like
 * this — it opens a real conversation, on the phone the owner already watches.
 * The message form is kept as the second option: it works without WhatsApp and,
 * unlike a chat, leaves a tracked record with a reference code.
 */
export default function AskPriceButtons({
  whatsapp,
  siteName,
  designName,
  className,
}: {
  /** The WhatsApp line, which may differ from the number on display. */
  whatsapp?: string | null;
  siteName: string;
  designName: string;
  className?: string;
}) {
  const enquiryHref = `/contact?about=${encodeURIComponent(designName)}`;

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2.5">
        {whatsapp && (
          <motion.a
            href={whatsappLink({ phone: whatsapp, siteName, designName })}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-white shadow-sm shadow-black/10"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2} />
            Ask price on WhatsApp
          </motion.a>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06, ease: EASE }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link
            href={enquiryHref}
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm transition-colors hover:border-accent hover:text-accent"
          >
            <Mail className="h-4 w-4" strokeWidth={1.75} />
            Send a message
          </Link>
        </motion.div>
      </div>

      <p className="mt-2.5 text-xs text-muted">
        Price depends on fabric and the embroidery work — ask and we&apos;ll quote you properly.
      </p>
    </div>
  );
}
