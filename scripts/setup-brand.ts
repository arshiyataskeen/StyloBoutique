import { prisma } from "@/lib/prisma";
import { DEFAULT_SECTION_ORDER, DEFAULT_STATS } from "@/lib/home-sections";

const TAGLINE = "Embroidery, maggam work and stitching — all under one roof.";

async function setupBrand() {
  await prisma.siteSettings.update({
    where: { id: "main" },
    data: {
      siteName: "Stylo Ladies Botique",

      logoUrl: "/media/logo/logo-on-light.webp",
      heroMediaType: "Video",
      heroVideoUrl: "/media/hero/background.mp4",
      heroPosterUrl: null,

      heroTagline: "Ladies Botique · Vijayawada",
      heroHeading: "Embroidery, maggam work & stitching.",
      heroSubheading:
        "All under one roof. Custom blouses, suits, bridal wear and kids wear, stitched to your exact measurements — browse, book a fitting, and track your order without an account.",

      footerTagline: TAGLINE,
      aboutHeading: "About Stylo",
      aboutText:
        "Stylo Ladies Botique is a family-run studio in Vijayawada. Every blouse, suit, bridal outfit and kids-wear piece is cut and stitched by hand to your own measurements — no mass production, no guesswork. We handle embroidery, maggam work and stitching in-house, so your garment is finished start to finish under one roof.",

      // Positions 1 and 4 render as tall tiles, so the strongest shots go there.
      galleryImages: [
        "/media/gallery/with-model/kids-wear-1.jpg",
        "/media/gallery/design/bridal-neckline.jpg",
        "/media/gallery/design/kids-wear-outfit.jpg",
        "/media/gallery/design/embroidery-work.jpg",
        "/media/gallery/with-model/kids-wear-2.jpg",
        "/media/gallery/design/bridal-motifs.jpg",
      ],

      stats: DEFAULT_STATS,
      homeSections: DEFAULT_SECTION_ORDER,
    },
  });

  console.log("Brand settings applied.");
}

setupBrand()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
