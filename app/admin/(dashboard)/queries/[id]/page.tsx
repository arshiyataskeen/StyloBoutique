"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import StatusBadge from "@/components/admin/StatusBadge";
import { QUERY_STATUSES } from "@/lib/constants";
import type { QueryDTO } from "@/lib/types";

export default function QueryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [query, setQuery] = useState<QueryDTO | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch(`/api/admin/queries/${id}`);
    const data = await res.json();
    setQuery(data.query);
  }

  useEffect(() => {
    let ignore = false;
    fetch(`/api/admin/queries/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setQuery(data.query);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  async function updateStatus(status: string) {
    await fetch(`/api/admin/queries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setSaving(true);
    await fetch(`/api/admin/queries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    setNote("");
    setSaving(false);
    load();
  }

  if (!query) return <p className="text-muted">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl sm:text-3xl">{query.refCode}</h1>
        <StatusBadge status={query.status} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-border bg-surface p-5 text-sm sm:grid-cols-2 sm:p-6">
        <div>
          <p className="text-muted">Name</p>
          <p>{query.name}</p>
        </div>
        {query.phone && (
          <div>
            <p className="text-muted">Phone</p>
            <p>{query.phone}</p>
          </div>
        )}
        {query.email && (
          <div>
            <p className="text-muted">Email</p>
            <p>{query.email}</p>
          </div>
        )}
        <div>
          <p className="text-muted">Received on</p>
          <p>{format(new Date(query.createdAt), "d MMM yyyy, h:mm a")}</p>
        </div>
        <div className="col-span-2">
          <p className="text-muted">Message</p>
          <p>{query.message}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <p className="mb-2 text-sm text-muted">Update status</p>
        <div className="flex flex-wrap gap-2">
          {QUERY_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                query.status === s ? "border-accent text-accent" : "border-border text-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <p className="mb-3 text-sm text-muted">Internal notes</p>
        <div className="space-y-3">
          {query.adminNotes.map((n, i) => (
            <div key={i} className="border-t border-border pt-3 text-sm first:border-t-0 first:pt-0">
              <span className="text-muted">{format(new Date(n.createdAt), "d MMM, h:mm a")} — </span>
              {n.note}
            </div>
          ))}
          {query.adminNotes.length === 0 && <p className="text-sm text-muted">No notes yet.</p>}
        </div>

        <form onSubmit={addNote} className="mt-4 flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add an internal note..."
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-foreground px-4 py-2 text-sm text-background disabled:opacity-60"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
