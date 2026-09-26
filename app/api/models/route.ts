import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export async function GET(request: NextRequest) {
  const categorySlug = request.nextUrl.searchParams.get("category");
  const featured = request.nextUrl.searchParams.get("featured");

  const where: Prisma.ModelWhereInput = { isActive: true };

  if (categorySlug) {
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) return NextResponse.json({ models: [] });
    where.categoryId = category.id;
  }

  if (featured === "true") {
    where.isFeatured = true;
  }

  const models = await prisma.model.findMany({
    where,
    include: { category: { select: { id: true, name: true, slug: true } } },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ models });
}
