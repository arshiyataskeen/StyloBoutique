import { NextRequest, NextResponse } from "next/server";
import { createAdminSessionToken, isAdminKeyValid } from "@/lib/auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const { key } = await request.json().catch(() => ({ key: "" }));

  if (typeof key !== "string" || !isAdminKeyValid(key)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  }

  const token = await createAdminSessionToken();
  const response = NextResponse.json({ ok: true });

  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
