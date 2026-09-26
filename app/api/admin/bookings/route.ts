import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@/lib/generated/prisma/client";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");

  const bookings = await prisma.booking.findMany({
    where: status ? { status: status as BookingStatus } : undefined,
    include: {
      model: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookings });
}
