import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { QueryStatus } from "@/lib/generated/prisma/client";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");

  const queries = await prisma.query.findMany({
    where: status ? { status: status as QueryStatus } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ queries });
}
