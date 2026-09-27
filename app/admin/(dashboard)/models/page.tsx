"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ImagePlus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  PRICE_DISPLAYS,
  PRICE_DISPLAY_HINTS,
  PRICE_DISPLAY_LABELS,
  resolvePriceDisplay,
  type PriceDisplay,
} from "@/lib/pricing";
import type { CategoryDTO, ModelDTO } from "@/lib/types";

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-surface text-foreground/75 hover:border-accent hover:text-accent"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
          active ? "bg-accent/15 text-accent" : "bg-background text-muted"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

export default function AdminModelsPage() {
  const [models, setModels] = useState<ModelDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");

  async function load() {
    const res = await fetch("/api/admin/models");
    const data = await res.json();
    setModels(data.models ?? []);
  }

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/models")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setModels(data.models ?? []);
      });
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setCategories(data.categories ?? []);
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Filtered in the browser rather than refetching: the whole list is already
  // here, and a shop's catalogue is never large enough to be worth a round trip.
  const categoryIdOf = (model: ModelDTO) =>
    typeof model.category === "string" ? model.category : model.category.id;

  const visible = categoryFilter
    ? models.filter((m) => categoryIdOf(m) === categoryFilter)
    : models;

  async function setPriceDisplay(model: ModelDTO, priceDisplay: PriceDisplay) {
    await fetch(`/api/admin/models/${model.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceDisplay }),
    });
    load();
  }

  async function toggleActive(model: ModelDTO) {
    await fetch(`/api/admin/models/${model.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !model.isActive }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this model? This can't be undone.")) return;
    await fetch(`/api/admin/models/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl sm:text-3xl">Models</h1>

        <Link
          href="/admin/models/new"
          className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm text-background transition-transform hover:scale-105"
        >
          <Plus className="h-4 w-4" /> New Model
        </Link>
      </div>

      {/* One button per category, side by side, with its count. Every option is
          visible at a glance — which is also how the public catalog shows
          them — rather than hidden behind a dropdown. */}
      <div className="mt-5 flex flex-wrap gap-2">
        <FilterPill
          label="All"
          count={models.length}
          active={categoryFilter === ""}
          onClick={() => setCategoryFilter("")}
        />
        {categories.map((c) => (
          <FilterPill
            key={c.id}
            label={c.name}
            count={models.filter((m) => categoryIdOf(m) === c.id).length}
            active={categoryFilter === c.id}
            onClick={() => setCategoryFilter(c.id)}
          />
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-background text-left text-muted">
            <tr>
              <th className="w-px px-5 py-3 font-normal">Photo</th>
              <th className="px-5 py-3 font-normal">Name</th>
              <th className="px-5 py-3 font-normal">Category</th>
              <th className="w-px whitespace-nowrap px-5 py-3 font-normal">Price</th>
              <th className="w-px whitespace-nowrap px-5 py-3 font-normal">Visitors see</th>
              <th className="w-px whitespace-nowrap px-5 py-3 font-normal">Status</th>
              <th className="w-px whitespace-nowrap px-5 py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((m) => (
              <tr key={m.id} className="border-t border-border">
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/models/${m.id}`}
                    title={m.images.length > 0 ? "Edit photos" : "Add a photo"}
                    className="block w-fit"
                  >
                    {m.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.images[0]}
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
                  <Link href={`/admin/models/${m.id}`} className="hover:text-accent">
                    {m.name}
                  </Link>
                  {m.images.length === 0 && (
                    <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
                      no photo
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-muted">
                  {typeof m.category === "string" ? m.category : m.category.name}
                </td>
                <td className="whitespace-nowrap px-5 py-3">{formatPrice(m.price)}</td>
                <td className="px-5 py-3">
                  {/* Changed here rather than only in the edit form, because
                      switching a design between showing and hiding its price is
                      a one-click decision, not a reason to open a whole page. */}
                  <select
                    value={resolvePriceDisplay(m.priceDisplay)}
                    onChange={(e) => setPriceDisplay(m, e.target.value as PriceDisplay)}
                    title={PRICE_DISPLAY_HINTS[resolvePriceDisplay(m.priceDisplay)]}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-accent"
                  >
                    {PRICE_DISPLAYS.map((d) => (
                      <option key={d} value={d}>
                        {PRICE_DISPLAY_LABELS[d]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleActive(m)}
                    className={m.isActive ? "text-emerald-600" : "text-muted"}
                  >
                    {m.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/models/${m.id}`} className="text-accent">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDelete(m.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-muted">
                  {/* An empty catalogue and an empty filter are different
                      situations, and the advice for each is different too. */}
                  {models.length === 0
                    ? "No designs yet — use “New Model” to add your first one."
                    : "No designs in this category. Choose another, or add one."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
