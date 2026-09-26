import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/public/PageHeader";
import SlowFadeStack from "@/components/public/SlowFadeStack";
import CylinderGallery from "@/components/public/CylinderGallery";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

// Customer reviews live on the Contact page, beside the form that collects
// them, rather than being repeated here.
async function getGalleryData() {
  const [models, settings] = await Promise.all([
    prisma.model.findMany({
      where: { isActive: true, images: { isEmpty: false } },
      select: { images: true },
    }),
    getSiteSettings(),
  ]);

  const designPhotos = models.flatMap((m) => m.images);
  const all = Array.from(new Set([...designPhotos, ...settings.galleryImages]));

  // Shuffled server-side, so the order varies per visit with no hydration mismatch.
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }

  return { images: all };
}

export default async function GalleryPage() {
  const { images } = await getGalleryData();

  return (
    <div className="pb-10 sm:pb-16">
      <PageHeader
        title="Gallery"
        description="Pieces we've cut, stitched and embroidered."
        bordered
      />

      {images.length > 0 ? (
        <section className="overflow-hidden py-8 sm:py-12">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 sm:gap-10 lg:grid-cols-2">
            {/* left — one frame at a time, drifting slowly */}
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-accent">In Detail</p>
              <SlowFadeStack images={images.slice(0, 8)} />
            </div>

            {/* right — the whole set turning on a cylinder */}
            <div>
              <p className="mb-3 text-center text-xs uppercase tracking-[0.2em] text-accent lg:text-left">
                Everything We&apos;ve Made
              </p>
              <CylinderGallery images={images} />
            </div>
          </div>
        </section>
      ) : (
        <p className="mx-auto max-w-6xl px-5 py-16 text-center text-muted">
          Photos of our work are coming soon.
        </p>
      )}

    </div>
  );
}
