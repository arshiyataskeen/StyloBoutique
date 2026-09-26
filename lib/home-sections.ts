import type { CopyItem, HomeStat, SectionContent } from "@/lib/types";

/** Every section the owner can show, hide or reorder on the homepage. */
export const HOME_SECTIONS = [
  { key: "quickLinks", label: "Quick links", hint: "Browse / Book / Track / Contact cards" },
  { key: "stats", label: "Numbers", hint: "Years of craft, garments tailored, …" },
  { key: "featured", label: "Featured designs", hint: "Category pills and highlighted designs" },
  { key: "process", label: "How it works", hint: "Consult → Measure → Craft → Deliver" },
  { key: "about", label: "About & gallery", hint: "Your story with the photo gallery" },
  {
    key: "instagram",
    label: "Instagram",
    hint: "Your handle with a photo strip — hidden until you add a handle",
  },
] as const;

export type HomeSectionKey = (typeof HOME_SECTIONS)[number]["key"];

export const DEFAULT_SECTION_ORDER: HomeSectionKey[] = [
  "stats",
  "quickLinks",
  "featured",
  "process",
  "about",
  "instagram",
];

export const DEFAULT_STATS: HomeStat[] = [
  { value: "15+", label: "Years of Craft" },
  { value: "1200+", label: "Garments Tailored" },
  { value: "800+", label: "Happy Customers" },
  { value: "100%", label: "Made to Measure" },
];

export const DEFAULT_CONTENT: SectionContent = {
  quickLinks: {
    heading: "Everything in one place",
    subheading: "No account needed — just pick where you want to go.",
    items: [
      { title: "Browse Catalog", description: "Explore made-to-measure designs across every category." },
      { title: "Book a Fitting", description: "Tell us what you need and get a reference code instantly." },
      { title: "Track Your Order", description: "Check your booking status anytime with your reference code." },
      { title: "Get in Touch", description: "Have a question? Send us a message and we'll respond soon." },
    ],
  },
  featured: {
    heading: "Featured Designs",
    ctaLabel: "Browse full catalog",
  },
  process: {
    eyebrow: "How It Works",
    heading: "From measurement to made",
    steps: [
      { title: "Consult", description: "Tell us what you need — browse the catalog or send us your own design." },
      { title: "Measure", description: "Book a fitting and we take your exact measurements, no guesswork." },
      { title: "Craft", description: "Every piece is hand-cut and stitched to your measurements alone." },
      { title: "Deliver", description: "Track your order with your reference code until it's ready to collect." },
    ],
  },
  instagram: {
    eyebrow: "Instagram",
    heading: "See our work up close",
    subheading:
      "New designs, fabrics and finished pieces — follow along for everything that leaves our studio.",
  },
};

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

function items(value: unknown, fallback: CopyItem[]): CopyItem[] {
  if (!Array.isArray(value)) return fallback;

  const clean = value.map((raw, i) => ({
    title: text((raw as CopyItem)?.title, fallback[i]?.title ?? ""),
    description: text((raw as CopyItem)?.description, fallback[i]?.description ?? ""),
  }));

  return clean.length > 0 ? clean : fallback;
}

/** Merges saved copy over the defaults so a partial save can never blank the page. */
export function resolveSectionContent(saved: unknown): SectionContent {
  const s = (typeof saved === "object" && saved !== null ? saved : {}) as Record<
    string,
    Record<string, unknown> | undefined
  >;

  return {
    quickLinks: {
      heading: text(s.quickLinks?.heading, DEFAULT_CONTENT.quickLinks.heading),
      subheading: text(s.quickLinks?.subheading, DEFAULT_CONTENT.quickLinks.subheading),
      items: items(s.quickLinks?.items, DEFAULT_CONTENT.quickLinks.items),
    },
    featured: {
      heading: text(s.featured?.heading, DEFAULT_CONTENT.featured.heading),
      ctaLabel: text(s.featured?.ctaLabel, DEFAULT_CONTENT.featured.ctaLabel),
    },
    process: {
      eyebrow: text(s.process?.eyebrow, DEFAULT_CONTENT.process.eyebrow),
      heading: text(s.process?.heading, DEFAULT_CONTENT.process.heading),
      steps: items(s.process?.steps, DEFAULT_CONTENT.process.steps),
    },
    instagram: {
      eyebrow: text(s.instagram?.eyebrow, DEFAULT_CONTENT.instagram.eyebrow),
      heading: text(s.instagram?.heading, DEFAULT_CONTENT.instagram.heading),
      subheading: text(s.instagram?.subheading, DEFAULT_CONTENT.instagram.subheading),
    },
  };
}

const VALID_KEYS = new Set<string>(HOME_SECTIONS.map((s) => s.key));

/**
 * Sections the owner has chosen, in their order. Anything unknown is dropped so
 * a stale key left in the database can never break the homepage.
 */
export function resolveSectionOrder(saved: unknown): HomeSectionKey[] {
  if (!Array.isArray(saved)) return DEFAULT_SECTION_ORDER;

  const chosen = saved.filter(
    (k): k is HomeSectionKey => typeof k === "string" && VALID_KEYS.has(k)
  );
  return chosen.length > 0 ? chosen : DEFAULT_SECTION_ORDER;
}

export function resolveStats(saved: unknown): HomeStat[] {
  if (!Array.isArray(saved)) return DEFAULT_STATS;

  const clean = saved.filter(
    (s): s is HomeStat =>
      typeof s === "object" &&
      s !== null &&
      typeof (s as HomeStat).value === "string" &&
      typeof (s as HomeStat).label === "string" &&
      (s as HomeStat).value.trim() !== "" &&
      (s as HomeStat).label.trim() !== ""
  );

  return clean.length > 0 ? clean : DEFAULT_STATS;
}
