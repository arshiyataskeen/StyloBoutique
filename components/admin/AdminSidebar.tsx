"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Shapes,
  Shirt,
  CalendarCheck,
  MessageSquare,
  Star,
  Image as ImageIcon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/public/Logo";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/categories", label: "Categories", icon: Shapes },
  { href: "/admin/models", label: "Models", icon: Shirt },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/queries", label: "Queries", icon: MessageSquare },
  { href: "/admin/feedback", label: "Feedback", icon: Star },
  { href: "/admin/settings", label: "Site Content", icon: ImageIcon },
];

export default function AdminSidebar({
  logoUrl,
  siteName,
}: {
  logoUrl?: string | null;
  siteName?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const nav = (
    <>
      <nav className="flex-1 space-y-1 px-3">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              // Closing here rather than in an effect on pathname keeps the
              // drawer from re-opening on back/forward navigation.
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors lg:py-2.5",
                active ? "bg-accent/10 text-accent" : "text-foreground/75 hover:bg-background"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mx-3 mb-6 flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-muted hover:bg-background lg:py-2.5"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        Log out
      </button>
    </>
  );

  return (
    <>
      {/* Phone / tablet: a bar with the menu button, since a permanent 240px
          rail would leave almost nothing for the page itself. */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg text-foreground/80 hover:bg-background"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/admin" className="min-w-0">
          <Logo src={logoUrl} alt={siteName} imgClassName="h-8 w-auto" />
        </Link>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-[80vw] max-w-xs flex-col overflow-y-auto border-r border-border bg-surface lg:hidden"
            >
              <div className="flex items-center justify-between px-5 py-5">
                <Logo src={logoUrl} alt={siteName} imgClassName="h-9 w-auto" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-background"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {nav}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Laptop and up: the permanent rail. */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-border bg-surface lg:flex">
        <div className="px-6 py-6">
          <Link href="/admin">
            <Logo src={logoUrl} alt={siteName} imgClassName="h-9 w-auto sm:h-10" />
          </Link>
        </div>
        {nav}
      </aside>
    </>
  );
}
