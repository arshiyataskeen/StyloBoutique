"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MediaUploader from "@/components/admin/MediaUploader";
import type { CategoryDTO } from "@/lib/types";

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [category, setCategory] = useState<CategoryDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategory((d.categories ?? []).find((c: CategoryDTO) => c.id === id) ?? null));
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!category) return;
    setError(null);
    setSaving(true);

    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
        displayOrder: category.displayOrder,
        isActive: category.isActive,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push("/admin/categories");
  }

  if (!category) return <p className="text-muted">Loading...</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-2xl sm:text-3xl">Edit Category</h1>

      <form onSubmit={handleSave} className="mt-6 space-y-5 rounded-2xl border border-border bg-surface p-6">
        <div>
          <label className="mb-1 block text-sm">Name</label>
          <input
            value={category.name}
            onChange={(e) => setCategory({ ...category, name: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Slug</label>
          <input
            value={category.slug}
            onChange={(e) => setCategory({ ...category, slug: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Description</label>
          <textarea
            value={category.description ?? ""}
            onChange={(e) => setCategory({ ...category, description: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Cover photo</label>
          <MediaUploader
            kind="site-image"
            accept="image/png,image/jpeg,image/webp,image/avif"
            value={category.imageUrl ?? ""}
            onChange={(url) => setCategory({ ...category, imageUrl: url })}
          />
          <p className="mt-1 text-xs text-muted">
            Shown on the catalog tile for this category. If empty, the first design&apos;s photo
            is used instead.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm">Display order</label>
          <input
            type="number"
            value={category.displayOrder}
            onChange={(e) => setCategory({ ...category, displayOrder: Number(e.target.value) })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={category.isActive}
            onChange={(e) => setCategory({ ...category, isActive: e.target.checked })}
          />
          Active (visible on the public site)
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-foreground px-6 py-2.5 text-sm text-background disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
