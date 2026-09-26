import { formatPrice } from "@/lib/utils";

export const PRICE_DISPLAYS = ["Exact", "From", "Hidden"] as const;
export type PriceDisplay = (typeof PRICE_DISPLAYS)[number];

export const PRICE_DISPLAY_LABELS: Record<PriceDisplay, string> = {
  Exact: "Show the price",
  From: "Show as a starting price",
  Hidden: "Hide the price — ask instead",
};

export const PRICE_DISPLAY_HINTS: Record<PriceDisplay, string> = {
  Exact: "Visitors see the exact figure, e.g. ₹2,500.",
  From: "Visitors see “From ₹2,500” — right for work that varies with fabric.",
  Hidden: "Visitors see “Price on request” and a button to ask you directly.",
};

/** Anything unexpected from the database falls back to the plain figure. */
export function resolvePriceDisplay(value: unknown): PriceDisplay {
  return PRICE_DISPLAYS.includes(value as PriceDisplay) ? (value as PriceDisplay) : "Exact";
}

/**
 * The single source of truth for how a price reads on the site, so the catalog
 * card, the design page and the booking summary can never disagree.
 */
export function priceLabel(price: number, display: unknown): string {
  switch (resolvePriceDisplay(display)) {
    case "Hidden":
      return "Price on request";
    case "From":
      return `From ${formatPrice(price)}`;
    default:
      return formatPrice(price);
  }
}

export function isPriceHidden(display: unknown): boolean {
  return resolvePriceDisplay(display) === "Hidden";
}

/**
 * Pre-written WhatsApp message naming the design, so the owner knows what is
 * being asked about without a follow-up question. Indian numbers entered as
 * 10 digits get the country code added.
 */
export function whatsappLink({
  phone,
  siteName,
  designName,
  pageUrl,
}: {
  phone: string;
  siteName: string;
  designName: string;
  pageUrl?: string;
}) {
  const digits = phone.replace(/\D/g, "");
  const number = digits.length === 10 ? `91${digits}` : digits;
  const text = encodeURIComponent(
    `Hi ${siteName}, could you tell me the price for "${designName}"?` +
      (pageUrl ? `\n${pageUrl}` : "")
  );

  return `https://wa.me/${number}?text=${text}`;
}
