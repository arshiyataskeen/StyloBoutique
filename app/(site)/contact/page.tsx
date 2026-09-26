import { ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ContactForm from "@/components/public/ContactForm";
import FadeIn from "@/components/public/FadeIn";
import FeedbackButton from "@/components/public/FeedbackButton";
import InstagramIcon from "@/components/public/InstagramIcon";
import Testimonials from "@/components/public/Testimonials";
import { getSiteSettings } from "@/lib/settings";
import { parseInstagram } from "@/lib/instagram";

export const dynamic = "force-dynamic";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ about?: string }>;
}) {
  // Approved reviews sit on this page now rather than the gallery, so the
  // reviews and the form that collects them are in one place.
  const [settings, { about }, feedback] = await Promise.all([
    getSiteSettings(),
    searchParams,
    prisma.feedback.findMany({
      where: { status: "Approved" },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, name: true, message: true, rating: true, createdAt: true },
    }),
  ]);
  const instagram = parseInstagram(settings.instagramUrl);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <FadeIn>
        <h1 className="font-serif text-3xl sm:text-4xl">Get in Touch</h1>
        <p className="mt-2 text-muted">
          {about
            ? `Ask us anything about ${about} — we'll reply with a proper quote.`
            : "Have a question that isn't a booking? Send us a message."}
        </p>
      </FadeIn>

      <FadeIn delay={0.1} className="mt-10">
        <ContactForm about={about} />
      </FadeIn>

      <FadeIn delay={0.2} className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <div>
            <h2 className="font-serif text-xl">Already had something stitched?</h2>
            <p className="mt-1 text-sm text-muted">
              Tell us how it turned out — it helps other customers decide.
            </p>
          </div>
          <FeedbackButton />
        </div>
      </FadeIn>

      {instagram && (
        <FadeIn delay={0.3} className="mt-6">
          <a
            href={instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            // No flex-wrap: the text is wide enough that the arrow was being
            // pushed onto a line of its own, stranded under the paragraph.
            className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent sm:p-6"
          >
            <div className="flex min-w-0 items-center gap-4">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                }}
              >
                <InstagramIcon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl">Find us on Instagram</h2>
                <p className="mt-1 text-sm text-muted">
                  @{instagram.handle} — new designs and finished pieces, posted as they leave the
                  studio.
                </p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
          </a>
        </FadeIn>
      )}

      {/* Only once there is something to show — an empty "no reviews yet" band
          above the footer is the gap this was meant to remove. */}
      {feedback.length > 0 && (
        <FadeIn delay={0.35} className="mt-10">
          <Testimonials feedback={feedback} bare />
        </FadeIn>
      )}
    </div>
  );
}
