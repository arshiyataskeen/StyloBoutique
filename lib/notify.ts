import { notificationHtml, sendMail, getMailStatus } from "@/lib/mailer";

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
