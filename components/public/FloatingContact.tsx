"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, MessageCircle, X, Plus } from "lucide-react";
import InstagramIcon from "@/components/public/InstagramIcon";
import { parseInstagram } from "@/lib/instagram";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function FloatingContact({
  phone,
  whatsapp,
  siteName,
  instagramUrl,
}: {
  /** Shown as "Call us". */
  phone: string;
  /** WhatsApp goes here — often a different line. Falls back to `phone`. */
  whatsapp?: string | null;
  siteName: string;
  instagramUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Hold it back until the visitor has actually started reading, so it does not
  // cover the hero the moment the page loads.
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2600);
    return () => clearTimeout(timer);
  }, []);

  // While open: close on an outside click, on Escape, or after 30s untouched.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    const idleTimer = setTimeout(() => setOpen(false), 30_000);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      clearTimeout(idleTimer);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const digits = (whatsapp || phone).replace(/\D/g, "");
  const waNumber = digits.length === 10 ? `91${digits}` : digits;
  const waText = encodeURIComponent(
    `Hi ${siteName}, I'd like to enquire about getting something stitched.`
  );

  const instagram = parseInstagram(instagramUrl);

  const actions = [
    ...(instagram
      ? [
          {
            href: instagram.url,
            label: `@${instagram.handle}`,
            icon: InstagramIcon,
            // Instagram's own gradient, so it reads instantly as the brand.
            className:
              "bg-[linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)] text-white",
            external: true,
          },
        ]
      : []),
    {
      href: `https://wa.me/${waNumber}?text=${waText}`,
      label: "WhatsApp",
      icon: MessageCircle,
      className: "bg-[#25D366] text-white",
      external: true,
    },
    {
      href: `tel:${phone.replace(/\s/g, "")}`,
      label: "Call us",
      icon: Phone,
      className: "bg-foreground text-background",
      external: false,
    },
  ];

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      // Offsets clear the iPhone home indicator, which viewportFit: "cover"
      // lets the page draw under.
      className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-[calc(1.25rem+env(safe-area-inset-right))] z-40 flex max-w-[calc(100vw-2.5rem)] flex-col items-end gap-3 sm:bottom-7 sm:right-7"
    >
      <AnimatePresence>
        {open &&
          actions.map((action, i) => (
            <motion.a
              key={action.label}
              href={action.href}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 14, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.9 }}
              transition={{ duration: 0.28, delay: i * 0.06, ease: EASE }}
              className={`flex items-center gap-2.5 rounded-full py-2.5 pl-4 pr-5 text-sm font-medium shadow-lg shadow-black/15 transition-transform hover:scale-105 ${action.className}`}
            >
              <action.icon className="h-4 w-4" strokeWidth={2} />
              {action.label}
            </motion.a>
          ))}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close contact options" : "Contact us"}
        aria-expanded={open}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: EASE }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-xl shadow-accent/30"
      >
        {!open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-accent/40 [animation-duration:2.5s]" />
        )}
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.25 }}>
          {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </motion.span>
      </motion.button>
    </div>
  );
}
