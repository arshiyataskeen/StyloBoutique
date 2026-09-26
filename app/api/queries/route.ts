import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queryInputSchema } from "@/lib/validators";
import { generateUniqueRefCode } from "@/lib/refCode";
import { notifyOwner } from "@/lib/notify";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = queryInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { email, phone, ...rest } = parsed.data;

  const refCode = await generateUniqueRefCode(
    async (code) => (await prisma.query.count({ where: { refCode: code } })) > 0,
    "QRY"
  );

  const query = await prisma.query.create({
    data: {
      ...rest,
      email: email || undefined,
      phone: phone || undefined,
      refCode,
    },
  });

  // Fire-and-forget: a mail outage must never fail the customer's enquiry.
  notifyOwner({
    heading: "New enquiry",
    refCode: query.refCode,
    rows: [
      ["Name", query.name],
      ["Phone", query.phone],
      ["Email", query.email],
      ["Message", query.message],
    ],
  });

  return NextResponse.json({ refCode: query.refCode }, { status: 201 });
}
