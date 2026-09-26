import { prisma } from "@/lib/prisma";

/**
 * Seeds cover photos for the categories we already have real imagery for.
 * The owner can replace any of these from Admin → Categories.
 */
const COVERS: Record<string, string> = {
  "kids-wear": "/media/gallery/with-model/kids-wear-1.jpg",
  "bridal-wear": "/media/gallery/design/bridal-neckline.jpg",
  blouses: "/media/gallery/design/embroidery-work.jpg",
  suits: "/media/gallery/design/bridal-motifs.jpg",
};

async function setCovers() {
  for (const [slug, imageUrl] of Object.entries(COVERS)) {
    const updated = await prisma.category.updateMany({
      where: { slug },
      data: { imageUrl },
    });
    console.log(`${slug}: ${updated.count === 1 ? "set" : "not found"}`);
  }
}

setCovers()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
