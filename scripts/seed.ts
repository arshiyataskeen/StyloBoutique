import { prisma } from "@/lib/prisma";

const CATEGORIES = [
  { name: "Blouses", slug: "blouses", displayOrder: 1 },
  { name: "Suits", slug: "suits", displayOrder: 2 },
  { name: "Bridal Wear", slug: "bridal-wear", displayOrder: 3 },
  { name: "Kids Wear", slug: "kids-wear", displayOrder: 4 },
];

async function seed() {
  const categoryDocs = [];
  for (const c of CATEGORIES) {
    const doc = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categoryDocs.push(doc);
  }

  const blouses = categoryDocs.find((c) => c.slug === "blouses")!;
  const suits = categoryDocs.find((c) => c.slug === "suits")!;

  const existingModels = await prisma.model.count();
  if (existingModels === 0) {
    await prisma.model.createMany({
      data: [
        {
          name: "Floral Anarkali Blouse",
          categoryId: blouses.id,
          description: "A hand-finished blouse with floral embroidery, tailored to your measurements.",
          price: 1200,
          priceNote: "excl. fabric cost",
          images: [],
          isFeatured: true,
        },
        {
          name: "Classic Two-Piece Suit",
          categoryId: suits.id,
          description: "A tailored two-piece suit, made to measure with a modern fit.",
          price: 4500,
          images: [],
          isFeatured: true,
        },
      ],
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });

  console.log(`Seeded ${categoryDocs.length} categories.`);
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
