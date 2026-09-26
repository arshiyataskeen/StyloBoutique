import Skeleton from "@/components/public/Skeleton";

/** Shown the instant a design is clicked, while the page data loads. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="grid gap-10 sm:grid-cols-2">
        <div>
          <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
          <div className="mt-3 flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-16 rounded-lg" />
            ))}
          </div>
        </div>

        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-9 w-3/4" />
          <Skeleton className="mt-5 h-7 w-32" />
          <Skeleton className="mt-6 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-8 h-12 w-44 rounded-full" />
        </div>
      </div>
    </div>
  );
}
