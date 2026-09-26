import { prisma } from "@/lib/prisma";
import BookingForm from "@/components/public/BookingForm";
import FadeIn from "@/components/public/FadeIn";
import type { ModelDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Loaded here rather than in the form so the chosen design is already on the
 * page at first paint — no flicker, and no race between the model and category
 * lookups the form does for the empty case.
 */
async function getPreselected(modelId?: string): Promise<ModelDTO | null> {
  if (!modelId) return null;

  const model = await prisma.model.findFirst({
    where: { id: modelId, isActive: true },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });

  return model as ModelDTO | null;
}

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ modelId?: string }>;
}) {
  const { modelId } = await searchParams;
  const preselected = await getPreselected(modelId);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <FadeIn>
        <h1 className="font-serif text-3xl sm:text-4xl">Book a Fitting</h1>
        <p className="mt-2 text-muted">
          {preselected
            ? "We've got the design you picked — just your details left."
            : "Tell us a bit about what you need."}{" "}
          No account required — we&apos;ll give you a reference code to track your booking.
        </p>
      </FadeIn>
      <FadeIn delay={0.1} className="mt-10">
        <BookingForm preselected={preselected} />
      </FadeIn>
    </div>
  );
}
