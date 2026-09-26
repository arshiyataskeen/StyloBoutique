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
