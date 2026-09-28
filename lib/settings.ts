import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Fields that are safe to send to a browser.
 *
 * Everything here is serialised into the public site's HTML and returned by the
 * public /api/settings route, so `smtpPass` must never be added to this list.
 * It is selected explicitly rather than by omission, so a future secret column
 * is excluded by default instead of leaking until someone remembers to hide it.
 */
const PUBLIC_FIELDS = {
  id: true,
  logoUrl: true,
  siteName: true,
  heroMediaType: true,
  heroVideoUrl: true,
  heroPosterUrl: true,
  heroImageUrl: true,
  heroTagline: true,
  heroHeading: true,
  heroSubheading: true,
  footerTagline: true,
  shopAddress: true,
  shopPhone: true,
  whatsappNumber: true,
  instagramUrl: true,
  youtubeUrl: true,
  aboutHeading: true,
  aboutText: true,
  galleryImages: true,
  stats: true,
  homeSections: true,
  sectionContent: true,
  updatedAt: true,
} as const;

/** Admin additionally sees where alerts go and which account sends them. */
const ADMIN_FIELDS = {
  ...PUBLIC_FIELDS,
  notifyEmail: true,
  smtpUser: true,
} as const;

async function ensureRow() {
  const existing = await prisma.siteSettings.findUnique({
    where: { id: "main" },
    select: { id: true },
  });
  if (!existing) await prisma.siteSettings.create({ data: { id: "main" } });
}

/** Public-safe settings. Used by the website and the public API. */
export const getSiteSettings = cache(async () => {
  await ensureRow();
  return prisma.siteSettings.findUniqueOrThrow({
    where: { id: "main" },
    select: PUBLIC_FIELDS,
  });
});

/** Admin settings — still excludes the password itself. */
export async function getAdminSettings() {
  await ensureRow();
  const settings = await prisma.siteSettings.findUniqueOrThrow({
    where: { id: "main" },
    select: ADMIN_FIELDS,
  });

  const withPass = await prisma.siteSettings.findUniqueOrThrow({
    where: { id: "main" },
    select: { smtpPass: true },
  });

  // The admin UI only needs to know whether a password is saved, not what it is.
  return { ...settings, smtpConfigured: Boolean(withPass.smtpPass) };
}

/** Server-only. Never expose the result of this through an API or a page. */
export async function getMailConfig() {
  const row = await prisma.siteSettings.findUnique({
    where: { id: "main" },
    select: { notifyEmail: true, smtpUser: true, smtpPass: true },
  });

  return {
    notifyEmail: row?.notifyEmail?.trim() || "",
    user: row?.smtpUser?.trim() || process.env.SMTP_USER || "",
    pass: row?.smtpPass || process.env.SMTP_PASS || "",
  };
}
