import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/public/PageHeader";
import CategoryGrid from "@/components/public/CategoryGrid";

export const dynamic = "force-dynamic";

async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    include: {
      _count: { select: { models: { where: { isActive: true } } } },
      models: {
        where: { isActive: true, images: { isEmpty: false } },
        orderBy: { displayOrder: "asc" },
        take: 1,
        select: { images: true },
      },
    },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    count: c._count.models,
    // The category's own photo wins; a design's photo is the fallback.
    cover: c.imageUrl || c.models[0]?.images[0] || null,
  }));
}

export default async function CatalogPage() {
  const categories = await getCategories();

  return (
    <div className="pb-16">
      <PageHeader
        title="Our Catalog"
        description="Every design is made to your measurements. Choose a style to explore."
        bordered
      />

      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
        {categories.length === 0 ? (
          <p className="py-16 text-center text-muted">
            Our catalog is being put together — coming soon.
          </p>
        ) : (
          <CategoryGrid categories={categories} />
        )}
      </div>

    </div>
  );
}
