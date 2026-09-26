"use client";

import { Plus, X } from "lucide-react";
import type { HomeStat } from "@/lib/types";
import { DEFAULT_STATS } from "@/lib/home-sections";

const MAX_STATS = 8;

export default function StatsEditor({
  value,
  onChange,
}: {
  value: HomeStat[];
  onChange: (next: HomeStat[]) => void;
}) {
  const stats = value.length > 0 ? value : DEFAULT_STATS;

  function update(index: number, patch: Partial<HomeStat>) {
    onChange(stats.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3">
      {stats.map((stat, i) => (
        <div key={i} className="flex items-start gap-2">
          <input
            value={stat.value}
            onChange={(e) => update(i, { value: e.target.value })}
            placeholder="15+"
            aria-label="Number"
            className="w-20 shrink-0 rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent sm:w-24"
          />
          <input
            value={stat.label}
            onChange={(e) => update(i, { label: e.target.value })}
            placeholder="Years of Craft"
            aria-label="Label"
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={() => onChange(stats.filter((_, idx) => idx !== i))}
            aria-label="Remove"
            className="mt-0.5 flex h-10 w-8 shrink-0 items-center justify-center text-muted hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      </div>

      {stats.length < MAX_STATS && (
        <button
          type="button"
          onClick={() => onChange([...stats, { value: "", label: "" }])}
          className="flex items-center gap-2 rounded-full border border-dashed border-border px-4 py-2 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <Plus className="h-3.5 w-3.5" /> Add a number
        </button>
      )}

      <p className="text-xs text-muted">
        Digits count up as visitors scroll past — write them however you like
        (&quot;15+&quot;, &quot;1200+&quot;, &quot;100%&quot;).
      </p>
    </div>
  );
}
