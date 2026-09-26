import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ModelCard from "@/components/public/ModelCard";
import PageHeader from "@/components/public/PageHeader";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

async function getCategoryWithModels(slug: string) {
  const category = await prisma.category.findFirst({ where: { slug, isActive: true } });
  if (!category) return null;

  const models = await prisma.model.findMany({
    where: { categoryId: category.id, isActive: true },
    include: { category: { select: { id: true, name: true, slug: true } } },
    orderBy: { displayOrder: "asc" },
  });

  return { category, models };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const [data, settings] = await Promise.all([
    getCategoryWithModels(categorySlug),
    getSiteSettings(),
  ]);

  if (!data) notFound();

  const { category, models } = data;

  return (
    <div className="pb-16">
      <PageHeader
        title={category.name}
        description={category.description}
        image={category.imageUrl}
        bordered
      />

      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
        {models.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-serif text-2xl">Coming soon</p>
            <p className="mt-2 text-sm text-muted">
              We&apos;re photographing our {category.name.toLowerCase()} designs now. In the
              meantime, book a fitting and we&apos;ll tailor to your own design.
            </p>
            <Link
              href="/book"
              className="mt-6 inline-block rounded-full bg-foreground px-6 py-2.5 text-sm text-background transition-transform hover:scale-105"
            >
              Book a Fitting
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {models.map((model, i) => (
              <ModelCard
                key={model.id}
                model={model}
                index={i}
                phone={settings.shopPhone}
                siteName={settings.siteName}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
