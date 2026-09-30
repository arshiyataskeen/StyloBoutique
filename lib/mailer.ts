import nodemailer from "nodemailer";
import { getMailConfig } from "@/lib/settings";

/**
 * Credentials are read per-send from the database (with env vars as a fallback)
 * so the owner can change them in the admin panel without a redeploy.
 */
export async function getMailStatus() {
  const { user, pass, notifyEmail } = await getMailConfig();
  return {
    configured: Boolean(user && pass),
    hasRecipient: Boolean(notifyEmail),
    user,
    notifyEmail,
  };
}

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { user, pass } = await getMailConfig();
  if (!user || !pass) throw new Error("Email is not configured.");

  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transport.sendMail({ from: `"Stylo Ladies Botique" <${user}>`, to, subject, html });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Customer-supplied values are escaped — they arrive from a public form. */
export function notificationHtml({
  heading,
  refCode,
  rows,
}: {
  heading: string;
  refCode: string;
  rows: [string, string | null | undefined][];
}) {
  const cells = rows
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<tr>
           <td style="padding:6px 14px 6px 0;color:#7a7168;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td>
           <td style="padding:6px 0;color:#201c18">${escapeHtml(String(value))}</td>
         </tr>`
    )
    .join("");

  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#faf7f2;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e7e0d6;border-radius:14px;padding:24px">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#ea6a12">Stylo Ladies Botique</p>
      <h1 style="margin:0 0 4px;font-size:20px;color:#201c18">${escapeHtml(heading)}</h1>
      <p style="margin:0 0 18px;color:#7a7168;font-size:13px">Reference <strong style="color:#201c18">${escapeHtml(refCode)}</strong></p>
      <table style="border-collapse:collapse;font-size:14px;width:100%">${cells}</table>
    </div>
  </div>`;
}

/**
 * The customer's copy — written to them rather than about them.
 *
 * Separate from notificationHtml because the audiences want opposite things:
 * the owner wants the customer's details at a glance, the customer wants their
 * code and what happens next. The code is set large because the whole point of
 * this mail is that they still have it in a week.
 */
export function customerHtml({
  heading,
  intro,
  refCode,
  body,
  trackUrl,
  siteName,
}: {
  heading: string;
  intro: string;
  refCode: string;
  /** Optional extra paragraph, e.g. the shop's latest update. */
  body?: string | null;
  trackUrl?: string | null;
  siteName: string;
}) {
  const extra = body?.trim()
    ? `<div style="margin:0 0 18px;padding:14px 16px;background:#faf7f2;border-radius:10px;border:1px solid #e7e0d6">
         <p style="margin:0;color:#201c18;font-size:14px;line-height:1.55">${escapeHtml(body.trim())}</p>
       </div>`
    : "";

  const track = trackUrl
    ? `<p style="margin:0;color:#7a7168;font-size:13px">
         Track your order any time at
         <a href="${escapeHtml(trackUrl)}" style="color:#ea6a12">${escapeHtml(trackUrl)}</a>
       </p>`
    : "";

  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#faf7f2;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e7e0d6;border-radius:14px;padding:24px">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#ea6a12">${escapeHtml(siteName)}</p>
      <h1 style="margin:0 0 10px;font-size:20px;color:#201c18">${escapeHtml(heading)}</h1>
      <p style="margin:0 0 18px;color:#5b534b;font-size:14px;line-height:1.55">${escapeHtml(intro)}</p>
      <p style="margin:0 0 6px;color:#7a7168;font-size:12px;letter-spacing:.1em;text-transform:uppercase">Your reference code</p>
      <p style="margin:0 0 18px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:26px;letter-spacing:.14em;color:#ea6a12">${escapeHtml(refCode)}</p>
      ${extra}
      ${track}
    </div>
  </div>`;
}
