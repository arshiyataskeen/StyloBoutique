import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queryUpdateSchema } from "@/lib/validators";
import { appendAdminNote } from "@/lib/adminNotes";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const query = await prisma.query.findUnique({ where: { id } });

  if (!query) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ query });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = queryUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.query.findUnique({ where: { id }, select: { adminNotes: true } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const query = await prisma.query.update({
    where: { id },
    data: {
      status: parsed.data.status,
      adminNotes: parsed.data.note ? appendAdminNote(existing.adminNotes, parsed.data.note) : undefined,
    },
  });

  return NextResponse.json({ query });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.query.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
