import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const model = await prisma.model.findFirst({
    where: { id, isActive: true },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });

  if (!model) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ model });
}
