import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const refCode = request.nextUrl.searchParams.get("refCode")?.trim();
  const phone = request.nextUrl.searchParams.get("phone")?.trim();

  if (!refCode && !phone) {
    return NextResponse.json({ error: "Provide a reference code or phone number" }, { status: 400 });
  }

  const bookings = await prisma.booking.findMany({
    where: refCode ? { refCode: refCode.toUpperCase() } : { phone },
    select: {
      id: true,
      refCode: true,
      customerName: true,
      status: true,
      model: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
      preferredDate: true,
      adminNotes: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (bookings.length === 0) {
    return NextResponse.json({ error: "No booking found" }, { status: 404 });
  }

  return NextResponse.json({ bookings });
}
