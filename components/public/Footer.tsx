import Link from "next/link";
import { MapPin, Phone, ArrowUpRight } from "lucide-react";
import Logo from "@/components/public/Logo";
import InstagramIcon from "@/components/public/InstagramIcon";
import { parseInstagram } from "@/lib/instagram";

export default function Footer({
  logoUrl,
  siteName,
  tagline,
  address,
  phone,
  instagramUrl,
}: {
  logoUrl?: string | null;
  siteName?: string;
  tagline?: string;
  address?: string | null;
  phone?: string | null;
  instagramUrl?: string | null;
}) {
  const instagram = parseInstagram(instagramUrl);
  const mapsHref = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null;

  return (
    <footer className="relative border-t border-border/80 bg-surface">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
      />
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-3 sm:gap-10 sm:py-14">
        <div>
          <Logo src={logoUrl} alt={siteName} />
          <p className="mt-4 max-w-xs text-sm text-muted">
            {tagline || "Made-to-measure tailoring, crafted for you."}
          </p>

          {instagram && (
            <a
              href={instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Follow ${siteName || "us"} on Instagram`}
              className="group mt-5 inline-flex items-center gap-2.5 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
            >
              <InstagramIcon className="h-4 w-4 text-accent" strokeWidth={1.75} />
              @{instagram.handle}
              <ArrowUpRight className="h-3.5 w-3.5 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
            </a>
          )}
        </div>

        {(address || phone) && (
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">Visit the Shop</p>
            <div className="mt-4 space-y-3">
              {address && (
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <p className="text-sm text-foreground/80">{address}</p>
                    {mapsHref && (
                      <a
                        href={mapsHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group mt-1 inline-flex items-center gap-1 text-sm text-accent hover:underline"
                      >
                        Get Directions{" "}
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-accent" />
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className="text-sm text-foreground/80 hover:text-accent">
                    {phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">Explore</p>
          {/*
            A row on a phone, a column from sm up. Four links stacked put four
            lines of almost nothing between the shop details and the bottom of
            a small screen; across, they take one. The sideways nudge on hover
            only makes sense in the column, so it is scoped to that.
          */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground/80 sm:flex-col sm:gap-2.5">
            {[
              { href: "/catalog", label: "Catalog" },
              { href: "/book", label: "Book a Fitting" },
              { href: "/track", label: "Track Order" },
              { href: "/contact", label: "Contact" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="w-fit transition-all hover:text-accent sm:hover:translate-x-1"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 py-4">
        <p className="text-center text-xs text-muted">
          © {new Date().getFullYear()} {siteName || "Stylo Tailor"}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
