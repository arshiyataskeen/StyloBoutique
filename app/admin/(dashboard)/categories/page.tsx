"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ImagePlus } from "lucide-react";
import MediaUploader from "@/components/admin/MediaUploader";
import type { CategoryDTO } from "@/lib/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories ?? []);
  }

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setCategories(data.categories ?? []);
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slugify(name), description, imageUrl }),
    });

    setCreating(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }

    setName("");
    setDescription("");
    setImageUrl("");
    load();
  }

  async function toggleActive(category: CategoryDTO) {
    await fetch(`/api/admin/categories/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !category.isActive }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? This can't be undone.")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Could not delete category");
      return;
    }
    load();
  }

  return (
    <div>
      <h1 className="font-serif text-2xl sm:text-3xl">Categories</h1>

      <form
        onSubmit={handleCreate}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4 sm:p-5"
      >
        {/* basis-full below sm so each control gets its own row instead of
            three squeezed side by side */}
        <div className="min-w-0 basis-full sm:flex-1 sm:basis-[180px]">
          <label className="mb-1 block text-sm">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div className="min-w-0 basis-full sm:flex-1 sm:basis-[220px]">
          <label className="mb-1 block text-sm">Description (optional)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div className="min-w-0 basis-full sm:basis-[180px]">
          <label className="mb-1 block text-sm">Cover photo (optional)</label>
          <MediaUploader
            kind="site-image"
            accept="image/png,image/jpeg,image/webp,image/avif"
            value={imageUrl}
            onChange={setImageUrl}
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm text-background disabled:opacity-60 sm:w-auto sm:py-2"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-background text-left text-muted">
            <tr>
              <th className="w-px px-5 py-3 font-normal">Photo</th>
              <th className="px-5 py-3 font-normal">Name</th>
              <th className="px-5 py-3 font-normal">Slug</th>
              <th className="w-px whitespace-nowrap px-5 py-3 font-normal">Status</th>
              <th className="w-px whitespace-nowrap px-5 py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/categories/${c.id}`}
                    title={c.imageUrl ? "Change cover photo" : "Add a cover photo"}
                    className="block w-fit"
                  >
                    {c.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.imageUrl}
                        alt=""
                        className="h-14 w-14 rounded-lg border border-border object-cover"
                      />
                    ) : (
                      <span className="flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-border text-accent transition-colors hover:border-accent hover:bg-accent/5">
                        <ImagePlus className="h-4 w-4" strokeWidth={1.5} />
                        <span className="text-[9px] uppercase tracking-wide">Add</span>
                      </span>
                    )}
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/admin/categories/${c.id}`} className="hover:text-accent">
                    {c.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-muted">{c.slug}</td>
                <td className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(c)}
                    aria-pressed={c.isActive}
                    title={c.isActive ? "Click to hide from the website" : "Click to show on the website"}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      c.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400"
                        : "border-border bg-background text-muted hover:border-accent hover:text-accent"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        c.isActive ? "bg-emerald-500" : "bg-muted/60"
                      }`}
                    />
                    {c.isActive ? "Active" : "Hidden"}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/categories/${c.id}`} className="text-accent">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
