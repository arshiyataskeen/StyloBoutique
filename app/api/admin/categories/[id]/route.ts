import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categoryInputSchema } from "@/lib/validators";
import { revalidateSite } from "@/lib/revalidate";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = categoryInputSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const category = await prisma.category.update({ where: { id }, data: parsed.data });
    revalidateSite();
    return NextResponse.json({ category });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const modelCount = await prisma.model.count({ where: { categoryId: id } });
  if (modelCount > 0) {
    return NextResponse.json(
      { error: "This category has models assigned to it. Reassign or delete them first." },
      { status: 409 }
    );
  }

  try {
    await prisma.category.delete({ where: { id } });
    revalidateSite();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
