"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ImagePlus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { ModelDTO } from "@/lib/types";

export default function AdminModelsPage() {
  const [models, setModels] = useState<ModelDTO[]>([]);

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
    return () => {
      ignore = true;
    };
  }, []);

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
          className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm text-background"
        >
          <Plus className="h-4 w-4" /> New Model
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-background text-left text-muted">
            <tr>
              <th className="w-px px-5 py-3 font-normal">Photo</th>
              <th className="px-5 py-3 font-normal">Name</th>
              <th className="px-5 py-3 font-normal">Category</th>
              <th className="w-px whitespace-nowrap px-5 py-3 font-normal">Price</th>
              <th className="w-px whitespace-nowrap px-5 py-3 font-normal">Status</th>
              <th className="w-px whitespace-nowrap px-5 py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m) => (
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
            {models.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted">
                  No designs yet — use “New Model” to add your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
