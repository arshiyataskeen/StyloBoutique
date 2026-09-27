import Skeleton from "@/components/public/Skeleton";

/** Shown the instant a category is clicked, while the page data loads. */
export default function Loading() {
  return (
    // Matches the real page, which dropped its own bottom padding.
    <div>
      <div className="border-b border-border/80 bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-4 h-[3px] w-12" />
          <Skeleton className="mt-4 h-5 w-80 max-w-full" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
              <Skeleton className="mt-3 h-5 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
