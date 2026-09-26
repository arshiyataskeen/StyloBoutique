"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingDTO } from "@/lib/types";
import { STATUS_COLORS, formatStatusLabel } from "@/lib/constants";

export default function TrackResult() {
  const [mode, setMode] = useState<"refCode" | "phone">("refCode");
  const [value, setValue] = useState("");
  const [bookings, setBookings] = useState<BookingDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBookings(null);
    setLoading(true);

    const params = new URLSearchParams({ [mode]: value.trim() });
    const res = await fetch(`/api/bookings/track?${params}`);
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }

    const data = await res.json();
    setBookings(data.bookings);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setMode("refCode")}
            className={cn(
              "rounded-full px-4 py-1.5 border",
              mode === "refCode" ? "border-accent text-accent" : "border-border text-muted"
            )}
          >
            By reference code
          </button>
          <button
            type="button"
            onClick={() => setMode("phone")}
            className={cn(
              "rounded-full px-4 py-1.5 border",
              mode === "phone" ? "border-accent text-accent" : "border-border text-muted"
            )}
          >
            By phone number
          </button>
        </div>

        <div className="flex gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={mode === "refCode" ? "e.g. STY-2461" : "e.g. 9876543210"}
            className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-accent"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm text-background disabled:opacity-60"
          >
            <Search className="h-4 w-4" /> {loading ? "Searching..." : "Track"}
          </button>
        </div>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {bookings && (
        <div className="mt-8 space-y-4">
          {bookings.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-accent">{b.refCode}</span>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    STATUS_COLORS[b.status] ?? "bg-gray-100 text-gray-800"
                  )}
                >
                  {formatStatusLabel(b.status)}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted">
                Booked {format(new Date(b.createdAt), "d MMM yyyy")}
              </p>
              {b.adminNotes.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-border pt-4">
                  <p className="text-xs uppercase tracking-wide text-muted">Updates</p>
                  {b.adminNotes.map((n, i) => (
                    <div key={i} className="text-sm">
                      <span className="text-muted">
                        {format(new Date(n.createdAt), "d MMM, h:mm a")} —{" "}
                      </span>
                      {n.note}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
