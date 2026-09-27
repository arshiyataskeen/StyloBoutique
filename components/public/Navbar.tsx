"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Images } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/public/Logo";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Catalog" },
  { href: "/book", label: "Book" },
  { href: "/track", label: "Track Order" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

/** Gallery is an icon on desktop, so it needs a text entry on mobile. */
const MOBILE_LINKS = [...LINKS, { href: "/gallery", label: "Gallery" }];

export default function Navbar({ logoUrl, siteName }: { logoUrl?: string | null; siteName?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2.5 sm:py-3">
        <Link href="/" className="transition-transform hover:scale-[1.02] active:scale-95">
          <Logo src={logoUrl} alt={siteName} />
        </Link>

        <ul className="hidden items-center gap-8 text-sm text-foreground/80 md:flex">
          {LINKS.map((link) => (
            <li key={link.href} className="relative">
              <Link
                href={link.href}
                className={cn(
                  "relative py-1 transition-colors hover:text-accent",
                  isActive(link.href) && "font-medium text-accent"
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {/* An icon rather than another word — the nav is already full. */}
          <Link
            href="/gallery"
            title="Gallery"
            aria-label="Gallery"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-accent hover:text-accent",
              isActive("/gallery") ? "border-accent text-accent" : "text-foreground/70"
            )}
          >
            <Images className="h-4 w-4" strokeWidth={1.75} />
          </Link>

          <Link
            href="/book"
            className="rounded-full bg-foreground px-5 py-2 text-sm text-background transition-transform hover:scale-105"
          >
            Book a Fitting
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          className="relative h-6 w-6 md:hidden"
          onClick={() => setOpen((o) => !o)}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={open ? "close" : "menu"}
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 45 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </nav>

      <div
        className={cn(
          "grid overflow-hidden border-border/80 transition-[grid-template-rows] duration-300 md:hidden",
          open ? "grid-rows-[1fr] border-t" : "grid-rows-[0fr]"
        )}
      >
        <ul className="min-h-0 flex flex-col gap-1 px-5 py-3">
          {MOBILE_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "block rounded-lg px-2 py-2 text-sm text-foreground/80 hover:bg-surface",
                  isActive(link.href) && "font-medium text-accent"
                )}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </motion.header>
  );
}
