import { prisma } from "@/lib/prisma";

/**
 * Attaches photos to the sample designs so the catalog and the design-page
 * gallery are not empty.
 *
 * The kids-wear entry uses genuine photos of that exact outfit. The blouse and
 * suit entries reuse embroidery shots as stand-ins — replace them from
 * Admin → Models once real photos of those pieces exist.
 */
const PHOTOS: Record<string, string[]> = {
  "Floral Anarkali Blouse": [
    "/media/gallery/design/bridal-neckline.jpg",
    "/media/gallery/design/bridal-motifs.jpg",
    "/media/gallery/design/embroidery-work.jpg",
  ],
  "Classic Two-Piece Suit": [
    "/media/gallery/design/embroidery-work.jpg",
    "/media/gallery/design/bridal-motifs.jpg",
  ],
};

const KIDS_WEAR = {
  name: "Pink & Gold Lehenga Set",
  description:
    "A pleated peplum top with hand-worked floral embroidery, paired with a gold brocade lehenga and a zari border. Stitched to your child's measurements.",
  price: 2800,
  priceNote: "excl. fabric cost",
  images: [
    "/media/gallery/with-model/kids-wear-1.jpg",
    "/media/gallery/design/kids-wear-outfit.jpg",
    "/media/gallery/with-model/kids-wear-2.jpg",
  ],
};

async function attach() {
  for (const [name, images] of Object.entries(PHOTOS)) {
    const result = await prisma.model.updateMany({ where: { name }, data: { images } });
    console.log(`${name}: ${result.count === 1 ? `${images.length} photos` : "not found"}`);
  }

  const kidsCategory = await prisma.category.findUnique({ where: { slug: "kids-wear" } });
  if (!kidsCategory) {
    console.log("kids-wear category missing — skipped");
    return;
  }

  const existing = await prisma.model.findFirst({ where: { name: KIDS_WEAR.name } });
  if (existing) {
    await prisma.model.update({ where: { id: existing.id }, data: { images: KIDS_WEAR.images } });
    console.log(`${KIDS_WEAR.name}: photos refreshed`);
    return;
  }

  await prisma.model.create({
    data: { ...KIDS_WEAR, categoryId: kidsCategory.id, isFeatured: true, displayOrder: 1 },
  });
  console.log(`${KIDS_WEAR.name}: created with ${KIDS_WEAR.images.length} photos`);
}

attach()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
