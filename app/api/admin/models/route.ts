import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { modelInputSchema } from "@/lib/validators";
import { revalidateSite } from "@/lib/revalidate";

export async function GET() {
  const models = await prisma.model.findMany({
    include: { category: { select: { id: true, name: true, slug: true } } },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ models });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = modelInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { category, ...rest } = parsed.data;

  const model = await prisma.model.create({
    data: { ...rest, categoryId: category },
  });

  revalidateSite();
  return NextResponse.json({ model }, { status: 201 });
}
