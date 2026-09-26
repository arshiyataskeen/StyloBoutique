import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { feedbackInputSchema } from "@/lib/validators";
import { notifyOwner } from "@/lib/notify";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = feedbackInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  // Always lands as Pending — public submissions are never shown until approved.
  const feedback = await prisma.feedback.create({ data: parsed.data });

  notifyOwner({
    heading: "New customer feedback",
    refCode: "Awaiting approval",
    rows: [
      ["Name", feedback.name],
      ["Rating", feedback.rating ? `${feedback.rating} / 5` : null],
      ["Feedback", feedback.message],
    ],
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
