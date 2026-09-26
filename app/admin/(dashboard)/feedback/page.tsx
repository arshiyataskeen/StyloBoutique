"use client";

import { useCallback, useEffect, useState } from "react";
import { Star, Check, EyeOff, Trash2, Clock } from "lucide-react";
import { format } from "date-fns";

type Feedback = {
  id: string;
  name: string;
  message: string;
  rating: number | null;
  status: "Pending" | "Approved" | "Hidden";
  createdAt: string;
};

const STATUS_STYLE: Record<Feedback["status"], string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Hidden: "bg-background text-muted border-border",
};

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  // setState has to stay inside the promise callback — calling a loader
  // synchronously in the effect body trips react-hooks/set-state-in-effect.
  const load = useCallback(() => {
    fetch("/api/admin/feedback")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.feedback ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("/api/admin/feedback")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.feedback ?? []);
        setLoading(false);
      });
  }, []);

  async function setStatus(id: string, status: Feedback["status"]) {
    await fetch(`/api/admin/feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this feedback? This can't be undone.")) return;
    await fetch(`/api/admin/feedback/${id}`, { method: "DELETE" });
    load();
  }

  const pending = items.filter((i) => i.status === "Pending").length;

  if (loading) return <p className="text-muted">Loading…</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl sm:text-3xl">Feedback</h1>
        {pending > 0 && (
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
            <Clock className="h-3.5 w-3.5" />
            {pending} awaiting your approval
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">
        Nothing appears on the website until you approve it.
      </p>

      {items.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-muted">
          No feedback yet.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-medium">{item.name}</span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wide ${STATUS_STYLE[item.status]}`}
                    >
                      {item.status}
                    </span>
                    {item.rating && (
                      <span className="flex gap-0.5" aria-label={`${item.rating} out of 5`}>
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star
                            key={s}
                            className={`h-3 w-3 ${s < item.rating! ? "text-accent" : "text-border"}`}
                            fill="currentColor"
                          />
                        ))}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {format(new Date(item.createdAt), "d MMM yyyy, HH:mm")}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {item.status !== "Approved" && (
                    <button
                      type="button"
                      onClick={() => setStatus(item.id, "Approved")}
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 transition-colors hover:border-emerald-400"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                  )}
                  {item.status !== "Hidden" && (
                    <button
                      type="button"
                      onClick={() => setStatus(item.id, "Hidden")}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
                    >
                      <EyeOff className="h-3.5 w-3.5" /> Hide
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label="Delete"
                    className="rounded-full p-1.5 text-muted transition-colors hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-foreground/80">{item.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
