import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ModelDetail from "@/components/public/ModelDetail";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

async function getModel(id: string) {
  return prisma.model.findFirst({
    where: { id, isActive: true },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ modelId: string }>;
}) {
  const { modelId } = await params;
  const [model, settings] = await Promise.all([getModel(modelId), getSiteSettings()]);

  if (!model) notFound();

  return (
    <ModelDetail
      model={model}
      whatsapp={settings.whatsappNumber || settings.shopPhone}
      siteName={settings.siteName}
    />
  );
}
