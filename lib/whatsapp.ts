import { formatStatusLabel } from "@/lib/constants";

/**
 * WhatsApp links — the only kind of WhatsApp this site can send.
 *
 * Worth being plain about the limit, because it shapes every feature built on
 * this file: a website cannot send someone a WhatsApp message on its own. That
 * needs the WhatsApp Business API — Meta business verification, a paid gateway,
 * and message templates approved in advance. What a wa.me link does is open
 * WhatsApp with the message already written, for a person to send.
 *
 * So the shop taps a button and the update goes out under its own number, and
 * the customer taps a button and their booking code lands in the shop's chat.
 * Both are one tap, neither is automatic, and nothing costs anything.
 *
 * Automatic notification, where it matters, is done by email instead.
 */

/**
 * WhatsApp wants a country code and digits only. Indian numbers are written
 * locally as ten digits, so those get 91; anything already carrying a country
 * code is left as it is.
 */
export function waNumber(phone?: string | null): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  // 11 digits starting 0 is the local trunk form — 0 9876543210.
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return null;
}

/** null when the number is unusable, so callers can hide the button instead of
 *  offering one that opens WhatsApp on nothing. */
export function waLink(phone: string | null | undefined, text: string): string | null {
  const number = waNumber(phone);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/**
 * What the customer sends the shop after booking.
 *
 * Carries the whole booking, not just the code, because it is doing two jobs
 * at once. For the customer it puts their reference somewhere they will find
 * it again — their own chat with the shop, which beats an email they will
 * never open. For the shop it *is* the WhatsApp notification of a new booking:
 * the site cannot send the owner a WhatsApp either, but the customer can, and
 * one tap from them lands the full details in the shop's inbox.
 *
 * It also opens WhatsApp's 24-hour window, so the shop can reply freely
 * afterwards without needing a paid template.
 */
export function bookingCodeMessage({
  siteName,
  refCode,
  customerName,
  phone,
  designName,
  preferredDate,
  notes,
}: {
  siteName: string;
  refCode: string;
  customerName?: string | null;
  phone?: string | null;
  designName?: string | null;
  preferredDate?: string | null;
  notes?: string | null;
}) {
  const lines = [`Hi ${siteName}, I've just booked a fitting.`, "", `Reference: ${refCode}`];

  if (customerName?.trim()) lines.push(`Name: ${customerName.trim()}`);
  if (phone?.trim()) lines.push(`Phone: ${phone.trim()}`);
  if (designName?.trim()) lines.push(`Design: ${designName.trim()}`);
  if (preferredDate?.trim()) lines.push(`Preferred date: ${preferredDate.trim()}`);
  if (notes?.trim()) lines.push("", `Notes: ${notes.trim()}`);

  return lines.join("\n");
}

/** What the shop sends the customer when something changes. */
export function statusUpdateMessage({
  siteName,
  customerName,
  refCode,
  status,
  note,
  trackUrl,
}: {
  siteName: string;
  customerName: string;
  refCode: string;
  status: string;
  /** The latest update, when there is one — usually the more useful line. */
  note?: string | null;
  trackUrl?: string | null;
}) {
  const lines = [
    `Hello ${customerName}, an update on your order with ${siteName}.`,
    "",
    `Reference: ${refCode}`,
    `Status: ${formatStatusLabel(status)}`,
  ];

  if (note?.trim()) lines.push("", note.trim());
  if (trackUrl) lines.push("", `Track it here: ${trackUrl}`);

  return lines.join("\n");
}
