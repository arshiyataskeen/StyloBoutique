import { notificationHtml, customerHtml, sendMail, getMailStatus } from "@/lib/mailer";

/** Where the customer can look their booking up. Empty if SITE_URL is unset. */
export function trackUrl() {
  const base = process.env.SITE_URL?.replace(/\/+$/, "");
  return base ? `${base}/track` : null;
}

/**
 * Emails the owner about a new booking or enquiry.
 *
 * Deliberately fire-and-forget and never throws: a customer's submission is
 * already saved by the time this runs, so a mail outage must not fail their
 * request. Failures are logged for the server operator instead.
 */
export function notifyOwner({
  heading,
  refCode,
  rows,
}: {
  heading: string;
  refCode: string;
  rows: [string, string | null | undefined][];
}) {
  void (async () => {
    try {
      const { configured, notifyEmail } = await getMailStatus();
      if (!configured || !notifyEmail) return;

      await sendMail({
        to: notifyEmail,
        subject: `${heading} — ${refCode}`,
        html: notificationHtml({ heading, refCode, rows }),
      });
    } catch (error) {
      console.error("[notify] could not send owner notification:", error);
    }
  })();
}

/**
 * Emails the customer — their booking code, or an update on it.
 *
 * This is the one channel that reaches them without anyone pressing send.
 * WhatsApp cannot be automated without the paid Business API, so the shop taps
 * a button for that; email goes on its own. Silently does nothing when the
 * customer left the email field empty, which is allowed.
 *
 * Same fire-and-forget contract as notifyOwner: the booking is already saved,
 * and a mail failure must not turn into a failed request for the customer.
 */
export function notifyCustomer({
  to,
  subject,
  heading,
  intro,
  refCode,
  body,
  siteName,
}: {
  to?: string | null;
  subject: string;
  heading: string;
  intro: string;
  refCode: string;
  body?: string | null;
  siteName: string;
}) {
  if (!to?.trim()) return;

  void (async () => {
    try {
      const { configured } = await getMailStatus();
      if (!configured) return;

      await sendMail({
        to: to.trim(),
        subject,
        html: customerHtml({ heading, intro, refCode, body, trackUrl: trackUrl(), siteName }),
      });
    } catch (error) {
      console.error("[notify] could not send customer notification:", error);
    }
  })();
}
