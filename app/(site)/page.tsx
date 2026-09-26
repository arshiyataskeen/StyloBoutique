import { prisma } from "@/lib/prisma";
import Hero from "@/components/public/Hero";
import QuickLinks from "@/components/public/QuickLinks";
import StatsBar from "@/components/public/StatsBar";
import FeaturedSection from "@/components/public/FeaturedSection";
import ProcessSection from "@/components/public/ProcessSection";
import AboutGallery from "@/components/public/AboutGallery";
import InstagramSection from "@/components/public/InstagramSection";
import { parseInstagram } from "@/lib/instagram";
import { getSiteSettings } from "@/lib/settings";
import { resolveSectionContent, resolveSectionOrder, resolveStats } from "@/lib/home-sections";

export const dynamic = "force-dynamic";

async function getFeatured() {
  const [categories, models, recent] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" } }),
    prisma.model.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { displayOrder: "asc" },
      take: 8,
    }),
    // Photo strip for the Instagram section — newest designs first.
    prisma.model.findMany({
      where: { isActive: true },
      select: { images: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  return { categories, models, recent };
}

export default async function HomePage() {
  const [{ categories, models, recent }, settings] = await Promise.all([
    getFeatured(),
    getSiteSettings(),
  ]);

  const order = resolveSectionOrder(settings.homeSections);
  const stats = resolveStats(settings.stats);
  const copy = resolveSectionContent(settings.sectionContent);
  const instagram = parseInstagram(settings.instagramUrl);

  // One photo per design so the strip doesn't repeat the same garment.
  const instagramImages = [
    ...new Set([...recent.map((m) => m.images[0]).filter(Boolean), ...settings.galleryImages]),
  ];

  const sections = {
    quickLinks: <QuickLinks key="quickLinks" content={copy.quickLinks} />,
    stats: <StatsBar key="stats" stats={stats} />,
    featured: (
      <FeaturedSection
        key="featured"
        categories={categories}
        models={models}
        content={copy.featured}
      />
    ),
    process: <ProcessSection key="process" content={copy.process} />,
    about: <AboutGallery key="about" settings={settings} />,
    // Nothing to show until the owner saves a handle in Admin → Site Content.
    instagram: instagram ? (
      <InstagramSection
        key="instagram"
        account={instagram}
        images={instagramImages}
        content={copy.instagram}
      />
    ) : null,
  };

  return (
    <>
      <Hero settings={settings} />
      {order.map((key) => sections[key])}
    </>
  );
}
