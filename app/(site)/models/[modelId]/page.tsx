import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ModelDetail from "@/components/public/ModelDetail";
import MoreDesigns from "@/components/public/MoreDesigns";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

async function getModel(id: string) {
  return prisma.model.findFirst({
    where: { id, isActive: true },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
}

/**
 * What to offer at the foot of the page — the rest of this design's category,
 * and every category. Split out because it needs the design's own category id,
 * so it cannot run in the same round trip as the design itself.
 */
async function getMore(categoryId: string | null, excludeId: string) {
  const [siblings, categories] = await Promise.all([
    categoryId
      ? prisma.model.findMany({
          where: { categoryId, isActive: true, id: { not: excludeId } },
          include: { category: { select: { id: true, name: true, slug: true } } },
          orderBy: { displayOrder: "asc" },
          // One row on a wide screen, two on a phone — enough to suggest there
          // is more without turning this into a second catalog page.
          take: 4,
        })
      : Promise.resolve([]),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { models: { where: { isActive: true } } } },
      },
    }),
  ]);

  return {
    siblings,
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      count: c._count.models,
    })),
  };
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ modelId: string }>;
}) {
  const { modelId } = await params;
  const [model, settings] = await Promise.all([getModel(modelId), getSiteSettings()]);

  if (!model) notFound();

  const { siblings, categories } = await getMore(model.categoryId, model.id);
  const whatsapp = settings.whatsappNumber || settings.shopPhone;
  const categoryCount = categories.find((c) => c.id === model.categoryId)?.count;

  return (
    <>
      <ModelDetail model={model} whatsapp={whatsapp} siteName={settings.siteName} />
      <MoreDesigns
        siblings={siblings}
        categories={categories}
        categoryName={model.category?.name}
        categorySlug={model.category?.slug}
        categoryCount={categoryCount}
        whatsapp={whatsapp}
        siteName={settings.siteName}
      />
    </>
  );
}
