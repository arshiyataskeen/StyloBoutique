"use client";

import { useEffect, useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import MediaUploader from "@/components/admin/MediaUploader";
import {
  PRICE_DISPLAYS,
  PRICE_DISPLAY_HINTS,
  PRICE_DISPLAY_LABELS,
  type PriceDisplay,
} from "@/lib/pricing";
import type { CategoryDTO } from "@/lib/types";

export type ModelFormValues = {
  name: string;
  category: string;
  description: string;
  price: number;
  priceNote: string;
  priceDisplay: PriceDisplay;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
};

const EMPTY: ModelFormValues = {
  name: "",
  category: "",
  description: "",
  price: 0,
  priceNote: "",
  priceDisplay: "Exact",
  images: [],
  isActive: true,
  isFeatured: false,
  displayOrder: 0,
};

export default function ModelForm({
  initialValues,
  onSubmit,
  submitLabel = "Save",
}: {
  initialValues?: Partial<ModelFormValues>;
  onSubmit: (values: ModelFormValues) => Promise<void>;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<ModelFormValues>({ ...EMPTY, ...initialValues });

  /**
   * The database stores one ordered `images` array whose first entry is the
   * cover — that is what the catalog tile and the booking summary read. The
   * form splits that in two so the cover is an explicit choice rather than
   * something you have to remember to drag into first place.
   *
   * Clearing the cover promotes the first gallery photo, which is simply what
   * "first in the array" already means everywhere else.
   */
  const cover = values.images[0] ?? "";
  const gallery = values.images.slice(1);

  const setCover = (url: string) =>
    setValues({ ...values, images: url ? [url, ...gallery] : gallery });

  const setGallery = (next: string[]) =>
    setValues({ ...values, images: cover ? [cover, ...next] : next });
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div>
        <label className="mb-1 block text-sm">Name</label>
        <input
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm">Category</label>
        <select
          value={values.category}
          onChange={(e) => setValues({ ...values, category: e.target.value })}
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm">Description</label>
        <textarea
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
          rows={4}
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">Price (INR)</label>
          <input
            type="number"
            min={0}
            value={values.price}
            onChange={(e) => setValues({ ...values, price: Number(e.target.value) })}
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Price note (optional)</label>
          <input
            value={values.priceNote}
            onChange={(e) => setValues({ ...values, priceNote: e.target.value })}
            placeholder="e.g. excl. fabric cost"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm">How visitors see the price</label>
        <select
          value={values.priceDisplay}
          onChange={(e) =>
            setValues({ ...values, priceDisplay: e.target.value as PriceDisplay })
          }
          className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
        >
          {PRICE_DISPLAYS.map((d) => (
            <option key={d} value={d}>
              {PRICE_DISPLAY_LABELS[d]}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted">
          {PRICE_DISPLAY_HINTS[values.priceDisplay]} The figure above is always kept for your own
          reference, whichever you choose.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">Cover photo</label>
          <MediaUploader
            kind="model-image"
            accept="image/png,image/jpeg,image/webp,image/avif"
            value={cover}
            onChange={setCover}
          />
          <p className="mt-1 text-xs text-muted">
            The one photo shown on the catalog tile and as the main image on the design page. Pick
            the clearest full view of the piece.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm">Gallery photos</label>
          <ImageUploader
            images={gallery}
            onChange={setGallery}
            kind="model-image"
            hint="The other views — back, neckline, fabric detail. Shown in a grid under the design."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => setValues({ ...values, isActive: e.target.checked })}
          />
          Active (visible on the public site)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.isFeatured}
            onChange={(e) => setValues({ ...values, isFeatured: e.target.checked })}
          />
          Featured on landing page
        </label>
      </div>

      <div>
        <label className="mb-1 block text-sm">Display order</label>
        <input
          type="number"
          value={values.displayOrder}
          onChange={(e) => setValues({ ...values, displayOrder: Number(e.target.value) })}
          className="w-32 rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-foreground px-6 py-2.5 text-sm text-background disabled:opacity-60"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
