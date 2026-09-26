import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { modelInputSchema } from "@/lib/validators";
import { revalidateSite } from "@/lib/revalidate";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const model = await prisma.model.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });

  if (!model) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ model });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = modelInputSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { category, ...rest } = parsed.data;

  try {
    const model = await prisma.model.update({
      where: { id },
      data: { ...rest, categoryId: category },
    });
    revalidateSite();
    return NextResponse.json({ model });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.model.delete({ where: { id } });
    revalidateSite();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
