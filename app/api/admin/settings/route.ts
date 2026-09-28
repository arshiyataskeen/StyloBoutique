import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSettings } from "@/lib/settings";
import { settingsInputSchema } from "@/lib/validators";
import { revalidateSite } from "@/lib/revalidate";
import { parseInstagram } from "@/lib/instagram";
import { parseYoutube } from "@/lib/youtube";

export async function GET() {
  // getAdminSettings() never includes smtpPass — only whether one is saved.
  return NextResponse.json({ settings: await getAdminSettings() });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const parsed = settingsInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await getAdminSettings();

  const data = Object.fromEntries(
    Object.entries(parsed.data).filter(([, v]) => v !== undefined)
  );

  // The form never receives the saved password, so it sends an empty string when
  // the field is left alone. Treat that as "keep what's already stored".
  if (typeof data.smtpPass === "string" && data.smtpPass.trim() === "") {
    delete data.smtpPass;
  }

  // Store one canonical profile URL whatever the owner typed, so every page can
  // derive the "@handle" from it.
  if (typeof data.instagramUrl === "string") {
    data.instagramUrl = parseInstagram(data.instagramUrl)?.url ?? "";
  }

  if (typeof data.youtubeUrl === "string") {
    data.youtubeUrl = parseYoutube(data.youtubeUrl)?.url ?? "";
  }

  await prisma.siteSettings.update({ where: { id: "main" }, data });

  revalidateSite();
  return NextResponse.json({ settings: await getAdminSettings() });
}
