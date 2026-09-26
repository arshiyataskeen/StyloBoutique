import { z } from "zod";
import { BOOKING_STATUSES, QUERY_STATUSES } from "@/lib/constants";
import { parseInstagram } from "@/lib/instagram";
import { PRICE_DISPLAYS } from "@/lib/pricing";

export const bookingInputSchema = z.object({
  customerName: z.string().trim().min(2, "Name is required"),
  phone: z.string().trim().min(7, "A valid phone number is required"),
  email: z.string().trim().email().optional().or(z.literal("")),
  modelId: z.string().trim().optional().or(z.literal("")),
  categoryId: z.string().trim().optional().or(z.literal("")),
  measurementsOrNotes: z.string().trim().optional().or(z.literal("")),
  preferredDate: z.string().trim().optional().or(z.literal("")),
});

export const queryInputSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  phone: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  message: z.string().trim().min(5, "Message is too short"),
});

export const feedbackInputSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(60),
  message: z.string().trim().min(10, "Please write a little more").max(1000),
  rating: z.number().int().min(1).max(5).optional(),
});

export const feedbackUpdateSchema = z.object({
  status: z.enum(["Pending", "Approved", "Hidden"]),
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z.string().trim().min(1, "Slug is required"),
  // description is nullable in the database, so the edit form legitimately
  // sends null back for a category that has never had one.
  description: z.string().trim().nullish(),
  imageUrl: z.string().trim().nullish(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const modelInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  category: z.string().trim().min(1, "Category is required"),
  description: z.string().trim().min(1, "Description is required"),
  price: z.number().min(0, "Price must be positive"),
  priceNote: z.string().trim().optional().or(z.literal("")),
  priceDisplay: z.enum(PRICE_DISPLAYS).optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  displayOrder: z.number().optional(),
});

export const bookingUpdateSchema = z.object({
  status: z.enum(BOOKING_STATUSES).optional(),
  note: z.string().trim().min(1).optional(),
});

export const queryUpdateSchema = z.object({
  status: z.enum(QUERY_STATUSES).optional(),
  note: z.string().trim().min(1).optional(),
});

export const settingsInputSchema = z.object({
  // These columns are nullable in the database, so the form legitimately sends
  // null back for anything the owner has cleared.
  logoUrl: z.string().trim().nullish(),
  siteName: z.string().trim().min(1, "Site name is required").optional(),
  heroMediaType: z.enum(["Video", "Image"]).optional(),
  heroVideoUrl: z.string().trim().nullish(),
  heroPosterUrl: z.string().trim().nullish(),
  heroImageUrl: z.string().trim().nullish(),
  heroTagline: z.string().trim().min(1).optional(),
  heroHeading: z.string().trim().min(1).optional(),
  heroSubheading: z.string().trim().min(1).optional(),
  footerTagline: z.string().trim().min(1).optional(),
  shopAddress: z.string().trim().nullish(),
  // Required: with prices hidden, getting in touch is the only route a visitor
  // has, so the site must never be left without a way to do it.
  shopPhone: z.string().trim().min(7, "A shop phone number is required").optional(),
  whatsappNumber: z
    .string()
    .trim()
    .min(7, "A WhatsApp number is required — it can differ from the shop phone")
    .optional(),
  // A handle ("@stylo_ladies") or any profile URL is accepted; the API
  // normalises it to a canonical URL before saving.
  instagramUrl: z
    .string()
    .trim()
    .min(1, "An Instagram handle is required")
    .refine((v) => parseInstagram(v) !== null, {
      message: "Enter your Instagram handle, e.g. @stylo_ladies",
    })
    .optional(),
  notifyEmail: z.string().trim().email("Enter a valid email").or(z.literal("")).nullish(),
  smtpUser: z.string().trim().email("Enter a valid Gmail address").or(z.literal("")).nullish(),
  smtpPass: z.string().nullish(),
  aboutHeading: z.string().trim().min(1).optional(),
  aboutText: z.string().trim().min(1).optional(),
  galleryImages: z.array(z.string()).optional(),
  stats: z
    .array(z.object({ value: z.string().trim(), label: z.string().trim() }))
    .max(8)
    .optional(),
  homeSections: z.array(z.string()).optional(),
  // Shape is re-validated on read by resolveSectionContent(), so anything
  // structurally odd falls back to defaults rather than breaking the page.
  sectionContent: z.record(z.string(), z.unknown()).optional(),
});
