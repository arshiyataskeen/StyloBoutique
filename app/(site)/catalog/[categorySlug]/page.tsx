import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CategoryNav from "@/components/public/CategoryNav";
import ModelCard from "@/components/public/ModelCard";
import PageHeader from "@/components/public/PageHeader";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

async function getCategoryWithModels(slug: string) {
  const category = await prisma.category.findFirst({ where: { slug, isActive: true } });
  if (!category) return null;

  // The full list comes back too, for the rail that lets you cross straight
  // from one category to the next without going via /catalog.
  const [models, categories] = await Promise.all([
    prisma.model.findMany({
      where: { categoryId: category.id, isActive: true },
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        // A photo to put on the card when the category has none of its own.
        models: {
          where: { isActive: true, images: { isEmpty: false } },
          orderBy: { displayOrder: "asc" },
          take: 1,
          select: { images: true },
        },
      },
    }),
  ]);

  return {
    category,
    models,
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      // Same rule as the catalog page: the category's own photo wins, a
      // design's photo is the fallback.
      cover: c.imageUrl || c.models[0]?.images[0] || null,
    })),
  };
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

  const { category, models, categories } = data;

  return (
    // No bottom padding here: the content block below already has py-8/py-12,
    // and stacking the two left a conspicuous empty band above the footer.
    <div>
      <PageHeader
        title={category.name}
        description={category.description}
        image={category.imageUrl}
        bordered
      />

      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
        {/* Matches the "Back to <category>" link on a design page, so every
            step into the catalog has a step back out of it. The full list of
            categories waits at the foot of the page — up here it would compete
            with the banner for the first thing you read. */}
        <Link
          href="/catalog"
          className="group mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to all categories
        </Link>

        {models.length === 0 ? (
          // No inner padding: the wrapper above already provides it, and
          // stacking the two left a conspicuous empty band under the header.
          <div className="text-center">
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
                whatsapp={settings.whatsappNumber || settings.shopPhone}
                siteName={settings.siteName}
              />
            ))}
          </div>
        )}
      </div>

      {/* Every other category, at the foot of the page — where you arrive after
          looking through this one, rather than before you have seen it. */}
      <section className="border-t border-border/80 bg-surface/40">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
            Browse another category
          </p>
          <div className="mt-4">
            <CategoryNav categories={categories} activeSlug={category.slug} />
          </div>
        </div>
      </section>
    </div>
  );
}
