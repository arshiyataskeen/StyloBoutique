import { NextResponse } from "next/server";
import { getMailStatus, notificationHtml, sendMail } from "@/lib/mailer";

/** Sends a sample alert so the owner can confirm delivery before going live. */
export async function POST() {
  const { configured, hasRecipient, notifyEmail } = await getMailStatus();

  if (!configured) {
    return NextResponse.json(
      { error: "Add the sending Gmail address and App Password, then save." },
      { status: 400 }
    );
  }

  if (!hasRecipient) {
    return NextResponse.json(
      { error: "Add the address alerts should go to, then save." },
      { status: 400 }
    );
  }

  try {
    await sendMail({
      to: notifyEmail,
      subject: "Test alert — STY-TEST",
      html: notificationHtml({
        heading: "Test alert",
        refCode: "STY-TEST",
        rows: [
          ["Name", "Test Customer"],
          ["Phone", "9000000000"],
          ["Notes", "If you can read this, booking and enquiry alerts will arrive here."],
        ],
      }),
    });

    return NextResponse.json({ ok: true, to: notifyEmail });
  } catch (error) {
    console.error("[notify-test] send failed:", error);
    return NextResponse.json(
      { error: "Could not send. Check SMTP_USER / SMTP_PASS and try again." },
      { status: 502 }
    );
  }
}
