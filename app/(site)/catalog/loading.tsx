import Skeleton from "@/components/public/Skeleton";

/** Shown the instant Catalog is clicked, while the category data loads. */
export default function Loading() {
  return (
    // Matches the real page, which dropped its own bottom padding — otherwise
    // the page shifts as the skeleton is replaced.
    <div>
      <div className="border-b border-border/80 bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="mt-4 h-[3px] w-12" />
          <Skeleton className="mt-4 h-5 w-96 max-w-full" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border">
              <Skeleton className="aspect-[16/10] w-full rounded-none" />
              <div className="p-5">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="mt-2 h-4 w-3/4" />
                <Skeleton className="mt-4 h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
