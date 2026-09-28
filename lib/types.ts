export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface CategoryRef {
  id: string;
  name: string;
  slug: string;
}

export interface ModelRef {
  id: string;
  name: string;
}

export interface ModelDTO {
  id: string;
  name: string;
  category: CategoryRef | string;
  description: string;
  price: number;
  priceNote?: string | null;
  /** Raw from the database — pass through resolvePriceDisplay() before use. */
  priceDisplay?: string | null;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
}

export interface AdminNoteDTO {
  note: string;
  createdAt: string;
}

export interface BookingDTO {
  id: string;
  refCode: string;
  customerName: string;
  phone: string;
  email?: string | null;
  model?: ModelRef | string | null;
  category?: CategoryRef | string | null;
  measurementsOrNotes?: string | null;
  preferredDate?: string | Date | null;
  status: string;
  adminNotes: AdminNoteDTO[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * A type alias rather than an interface: only aliases get an implicit index
 * signature, which Prisma's JSON input type requires.
 */
export type CopyItem = {
  title: string;
  description: string;
};

/**
 * Editable headings and card copy for the homepage sections. Every field is
 * optional — anything missing falls back to the built-in default.
 */
export type SectionContent = {
  quickLinks: { heading: string; subheading: string; items: CopyItem[] };
  featured: { heading: string; ctaLabel: string };
  process: { eyebrow: string; heading: string; steps: CopyItem[] };
  instagram: { eyebrow: string; heading: string; subheading: string };
};

export type HomeStat = {
  /** Free text so the owner can write "15+", "100%", "1200+" etc. */
  value: string;
  label: string;
};

export interface SiteSettingsDTO {
  id: string;
  logoUrl?: string | null;
  siteName: string;
  heroMediaType: "Video" | "Image";
  heroVideoUrl?: string | null;
  heroPosterUrl?: string | null;
  heroImageUrl?: string | null;
  heroTagline: string;
  heroHeading: string;
  heroSubheading: string;
  footerTagline: string;
  shopAddress?: string | null;
  shopPhone?: string | null;
  /** WhatsApp goes to its own number, separate from the one on display. */
  whatsappNumber?: string | null;
  instagramUrl?: string | null;
  /** Optional. Shown only in the footer and on the Contact page. */
  youtubeUrl?: string | null;
  notifyEmail?: string | null;
  smtpUser?: string | null;
  /** Only ever sent admin → server. The API never returns a saved password. */
  smtpPass?: string | null;
  /** Admin-only: whether a password is stored, without revealing it. */
  smtpConfigured?: boolean;
  aboutHeading: string;
  aboutText: string;
  galleryImages: string[];
  /** Raw JSON straight from the database — pass through resolveStats() before use. */
  stats: unknown;
  homeSections: string[];
  /** Raw JSON — pass through resolveSectionContent() before use. */
  sectionContent: unknown;
}

export interface QueryDTO {
  id: string;
  refCode: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  message: string;
  status: string;
  adminNotes: AdminNoteDTO[];
  createdAt: string | Date;
  updatedAt: string | Date;
}
