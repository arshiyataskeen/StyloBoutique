import TrackResult from "@/components/public/TrackResult";
import FadeIn from "@/components/public/FadeIn";

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <FadeIn>
        <h1 className="font-serif text-3xl sm:text-4xl">Track My Order</h1>
        <p className="mt-2 text-muted">
          Enter your reference code or the phone number you booked with.
        </p>
      </FadeIn>
      <FadeIn delay={0.1} className="mt-10">
        <TrackResult />
      </FadeIn>
    </div>
  );
}
