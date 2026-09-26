import { SignJWT, jwtVerify } from "jose";
import { createHash, timingSafeEqual } from "crypto";

const SESSION_DURATION = "12h";

function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET environment variable");
  return new TextEncoder().encode(secret);
}

export function isAdminKeyValid(candidate: string) {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || !candidate) return false;

  const candidateHash = createHash("sha256").update(candidate).digest();
  const actualHash = createHash("sha256").update(adminKey).digest();

  return timingSafeEqual(candidateHash, actualHash);
}

export async function createAdminSessionToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getJwtSecretKey());
}

export async function verifyAdminSessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
