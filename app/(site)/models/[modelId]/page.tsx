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
 * The rest of this design's category, for the row at the foot of the page.
 * Split out because it needs the design's own category id, so it cannot run in
 * the same round trip as the design itself.
 */
async function getSiblings(categoryId: string | null, excludeId: string) {
  if (!categoryId) return { siblings: [], categoryCount: 0 };

  const [siblings, categoryCount] = await Promise.all([
    prisma.model.findMany({
      where: { categoryId, isActive: true, id: { not: excludeId } },
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { displayOrder: "asc" },
      // Four show at once and the rest scroll, so this is the size of the pool
      // rather than the size of the row.
      take: 12,
    }),
    prisma.model.count({ where: { categoryId, isActive: true } }),
  ]);

  return { siblings, categoryCount };
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ modelId: string }>;
}) {
  const { modelId } = await params;
  const [model, settings] = await Promise.all([getModel(modelId), getSiteSettings()]);

  if (!model) notFound();

  const { siblings, categoryCount } = await getSiblings(model.categoryId, model.id);
  const whatsapp = settings.whatsappNumber || settings.shopPhone;

  return (
    <>
      <ModelDetail model={model} whatsapp={whatsapp} siteName={settings.siteName} />
      <MoreDesigns
        siblings={siblings}
        categoryName={model.category?.name}
        categorySlug={model.category?.slug}
        categoryCount={categoryCount}
        whatsapp={whatsapp}
        siteName={settings.siteName}
      />
    </>
  );
}
