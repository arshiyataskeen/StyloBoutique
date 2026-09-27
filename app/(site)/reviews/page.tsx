import { MessageSquareQuote } from "lucide-react";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/public/PageHeader";
import FadeIn from "@/components/public/FadeIn";
import FeedbackButton from "@/components/public/FeedbackButton";
import ReviewsBrowser from "@/components/public/ReviewsBrowser";

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

  return (
    <div>
      <PageHeader
        title="Customer Reviews"
        description="What people say about the pieces we've stitched for them."
        bordered
      />

      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
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
          <ReviewsBrowser feedback={feedback} />
        )}

        <p className="mt-8 text-center text-xs text-muted">
          Every review is read before it appears here.
        </p>
      </div>
    </div>
  );
}
