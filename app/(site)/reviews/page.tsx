import { MessageSquareQuote, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/public/PageHeader";
import FadeIn from "@/components/public/FadeIn";
import FeedbackButton from "@/components/public/FeedbackButton";
import Testimonials from "@/components/public/Testimonials";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reviews",
  description:
    "What our customers say about their blouses, suits, bridal wear and kids wear from Stylo Ladies Botique.",
};

async function getReviews() {
  return prisma.feedback.findMany({
    where: { status: "Approved" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, message: true, rating: true, createdAt: true },
  });
}

export default async function ReviewsPage() {
  const feedback = await getReviews();

  const rated = feedback.filter((f) => typeof f.rating === "number");
  const average =
    rated.length > 0
      ? rated.reduce((sum, f) => sum + (f.rating ?? 0), 0) / rated.length
      : null;

  return (
    <div>
      <PageHeader
        title="Customer Reviews"
        description="What people say about the pieces we've stitched for them."
        bordered
      />

      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
        {/* The summary only appears once there is something to summarise —
            "0 reviews, no rating" is worse than saying nothing. */}
        {feedback.length > 0 && (
          <FadeIn className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {average !== null && (
                <div className="flex items-center gap-3">
                  <span className="font-serif text-3xl text-accent">{average.toFixed(1)}</span>
                  <span className="flex gap-0.5" aria-label={`${average.toFixed(1)} out of 5`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(average) ? "text-accent" : "text-border"
                        }`}
                        fill="currentColor"
                      />
                    ))}
                  </span>
                </div>
              )}
              <p className="text-sm text-muted">
                {feedback.length} {feedback.length === 1 ? "review" : "reviews"}
                {rated.length > 0 && average !== null && ` · ${rated.length} rated`}
              </p>
            </div>

            <FeedbackButton />
          </FadeIn>
        )}

        {feedback.length === 0 ? (
          <FadeIn className="rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
            <MessageSquareQuote
              className="mx-auto h-10 w-10 text-accent/60"
              strokeWidth={1.25}
            />
            <h2 className="mt-4 font-serif text-2xl">No reviews yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              If we&apos;ve stitched something for you, we&apos;d love to hear how it turned out —
              and it helps the next customer decide.
            </p>
            <div className="mt-6 flex justify-center">
              <FeedbackButton />
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={0.1}>
            {/* headless: the page title already says what this is. */}
            <Testimonials feedback={feedback} bare headless />
          </FadeIn>
        )}

        <p className="mt-8 text-center text-xs text-muted">
          Every review is read before it appears here.
        </p>
      </div>
    </div>
  );
}
