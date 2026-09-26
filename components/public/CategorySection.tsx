import { CategoryDTO, ModelDTO } from "@/lib/types";
import ModelCard from "@/components/public/ModelCard";
import FadeIn from "@/components/public/FadeIn";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CategorySection({
  category,
  models,
}: {
  category: CategoryDTO;
  models: ModelDTO[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <FadeIn onScroll className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-2xl">{category.name}</h2>
          {category.description && (
            <p className="mt-1 text-sm text-muted">{category.description}</p>
          )}
        </div>
        {models.length > 0 && (
          <Link
            href={`/catalog/${category.slug}`}
            className="group flex items-center gap-1 text-sm text-accent hover:underline"
          >
            View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </FadeIn>
      {models.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {models.map((model, i) => (
            <ModelCard key={model.id} model={model} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-8 text-muted">
          <Sparkles className="h-5 w-5 shrink-0 text-accent/60" strokeWidth={1.5} />
          <p className="text-sm">New designs for {category.name} are on the way — check back soon.</p>
        </div>
      )}
    </section>
  );
}
