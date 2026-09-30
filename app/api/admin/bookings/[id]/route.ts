import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingUpdateSchema } from "@/lib/validators";
import { appendAdminNote } from "@/lib/adminNotes";
import { notifyCustomer } from "@/lib/notify";
import { getSiteSettings } from "@/lib/settings";
import { formatStatusLabel } from "@/lib/constants";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      model: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ booking });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = bookingUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.booking.findUnique({
    where: { id },
    select: { adminNotes: true, status: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: {
      status: parsed.data.status,
      adminNotes: parsed.data.note ? appendAdminNote(existing.adminNotes, parsed.data.note) : undefined,
    },
  });

  // Tell the customer, but only when something they would care about actually
  // changed — re-clicking the status they are already on should not send them
  // another email saying nothing happened.
  const statusChanged = Boolean(parsed.data.status && parsed.data.status !== existing.status);
  const noteAdded = Boolean(parsed.data.note?.trim());

  if (statusChanged || noteAdded) {
    const settings = await getSiteSettings();
    notifyCustomer({
      to: booking.email,
      siteName: settings.siteName,
      subject: `Update on your order — ${booking.refCode}`,
      heading: noteAdded ? "An update on your order" : `Your order is now ${formatStatusLabel(booking.status)}`,
      intro: `Hello ${booking.customerName}, here's where your order stands.`,
      refCode: booking.refCode,
      body: parsed.data.note ?? `Status: ${formatStatusLabel(booking.status)}`,
    });
  }

  return NextResponse.json({ booking });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
