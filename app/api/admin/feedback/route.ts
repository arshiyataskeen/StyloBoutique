import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { feedbackInputSchema } from "@/lib/validators";
import { revalidateSite } from "@/lib/revalidate";

export async function GET() {
  const feedback = await prisma.feedback.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ feedback });
}

/**
 * A review entered by the owner — one given in the shop, over the phone or on
 * WhatsApp, which would otherwise never reach the website.
 *
 * Saved as Approved, unlike the public form: the approval step exists to stop
 * strangers publishing to the site, and the owner is the one who approves. It
 * can still be hidden or deleted afterwards like any other.
 */
export async function POST(request: NextRequest) {
  const parsed = feedbackInputSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const feedback = await prisma.feedback.create({
    data: { ...parsed.data, status: "Approved" },
  });

  revalidateSite();
  return NextResponse.json({ feedback }, { status: 201 });
}
