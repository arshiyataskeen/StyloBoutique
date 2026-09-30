import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingInputSchema } from "@/lib/validators";
import { generateUniqueRefCode } from "@/lib/refCode";
import { notifyOwner, notifyCustomer } from "@/lib/notify";
import { getSiteSettings } from "@/lib/settings";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = bookingInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { modelId, categoryId, email, measurementsOrNotes, preferredDate, ...rest } = parsed.data;

  const refCode = await generateUniqueRefCode(
    async (code) => (await prisma.booking.count({ where: { refCode: code } })) > 0,
    "STY"
  );

  const booking = await prisma.booking.create({
    data: {
      ...rest,
      email: email || undefined,
      modelId: modelId || undefined,
      categoryId: categoryId || undefined,
      measurementsOrNotes: measurementsOrNotes || undefined,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
      refCode,
    },
  });

  // Fire-and-forget: a mail outage must never fail the customer's booking.
  notifyOwner({
    heading: "New booking request",
    refCode: booking.refCode,
    rows: [
      ["Name", booking.customerName],
      ["Phone", booking.phone],
      ["Email", booking.email],
      ["Preferred date", booking.preferredDate?.toDateString()],
      ["Notes", booking.measurementsOrNotes],
    ],
  });

  // And the customer's own copy, so the code survives closing the tab. Does
  // nothing when they left the email blank — it is an optional field.
  const settings = await getSiteSettings();
  notifyCustomer({
    to: booking.email,
    siteName: settings.siteName,
    subject: `Your booking is in — ${booking.refCode}`,
    heading: "We've got your booking",
    intro: `Thank you, ${booking.customerName}. We'll call you on ${booking.phone} to confirm the details. Keep the code below — it's how you check on your order.`,
    refCode: booking.refCode,
  });

  return NextResponse.json({ refCode: booking.refCode }, { status: 201 });
}
