"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Star,
  Check,
  EyeOff,
  Trash2,
  Clock,
  PenLine,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import RatingFaces, { labelForRating } from "@/components/RatingFaces";

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

/** Blank form, and what "Add" resets back to. */
const EMPTY_DRAFT = { name: "", message: "", rating: 5 };

/** Reviews per page. Enough to scan, few enough to avoid endless scrolling. */
const PAGE_SIZE = 10;

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

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

  async function addReview(event: React.FormEvent) {
    event.preventDefault();
    setAddError(null);
    setAdding(true);

    const res = await fetch("/api/admin/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });

    setAdding(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setAddError(data.error ?? "Could not add that review.");
      return;
    }

    setDraft(EMPTY_DRAFT);
    // A new review lands at the top, so go and look at it.
    setPage(1);
    load();
  }

  const pending = items.filter((i) => i.status === "Pending").length;

  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  // Clamped rather than stored blindly: deleting the last review on the final
  // page would otherwise leave you looking at a page that no longer exists.
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const visible = items.slice(start, start + PAGE_SIZE);

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

      {/*
        Reviews given in the shop, on the phone or over WhatsApp would never
        reach the site otherwise. Added here they go straight to Approved —
        the approval step is there to stop strangers publishing, and you are
        the one who approves.
      */}
      <form
        onSubmit={addReview}
        className="mt-6 rounded-2xl border border-border bg-surface p-5 sm:p-6"
      >
        <div className="flex items-center gap-2">
          <PenLine className="h-4 w-4 text-accent" />
          <h2 className="font-serif text-lg">Add a review yourself</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          For feedback a customer gave you in person. It is published straight away.
        </p>

        <div className="mt-4">
          <label className="mb-1 block text-sm">Customer name</label>
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            required
            minLength={2}
            maxLength={60}
            placeholder="e.g. Anjali R"
            className="w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
        </div>

        {/* The same face scale the customer sees, so a rating given over the
            counter and one left on the site mean the same thing. */}
        <div className="mt-4 max-w-md">
          <span className="mb-2 block text-sm">How did it turn out?</span>
          <RatingFaces
            value={draft.rating}
            onChange={(rating) => setDraft({ ...draft, rating })}
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm">What they said</label>
          <textarea
            value={draft.message}
            onChange={(e) => setDraft({ ...draft, message: e.target.value })}
            required
            minLength={10}
            maxLength={1000}
            rows={3}
            placeholder="The blouse fit perfectly and the maggam work is beautiful."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
        </div>

        {addError && <p className="mt-2 text-sm text-red-600">{addError}</p>}

        <button
          type="submit"
          disabled={adding}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm text-background transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
        >
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {adding ? "Adding…" : "Add review"}
        </button>
      </form>

      {items.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-muted">
          No feedback yet.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {visible.map((item) => (
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
                      <span className="flex items-center gap-1.5">
                        <span className="flex gap-0.5" aria-label={`${item.rating} out of 5`}>
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star
                              key={s}
                              className={`h-3 w-3 ${
                                s < item.rating! ? "text-accent" : "text-border"
                              }`}
                              fill="currentColor"
                            />
                          ))}
                        </span>
                        {/* The word too, so the list reads in the same terms the
                            customer chose from rather than as a bare score. */}
                        <span className="text-xs text-muted">{labelForRating(item.rating)}</span>
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

          {/* Only worth showing once there is more than one page of them. */}
          {pageCount > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-muted">
                Showing {start + 1}–{Math.min(start + PAGE_SIZE, items.length)} of {items.length}
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage(current - 1)}
                  disabled={current === 1}
                  aria-label="Previous page"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: pageCount }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage(i + 1)}
                    aria-current={current === i + 1}
                    className={`h-9 min-w-9 rounded-full px-3 text-sm tabular-nums transition-colors ${
                      current === i + 1
                        ? "bg-foreground text-background"
                        : "border border-border text-muted hover:border-accent hover:text-accent"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPage(current + 1)}
                  disabled={current === pageCount}
                  aria-label="Next page"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
