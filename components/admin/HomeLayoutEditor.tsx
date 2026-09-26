"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import { HOME_SECTIONS, resolveSectionOrder } from "@/lib/home-sections";

export default function HomeLayoutEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const order = resolveSectionOrder(value);
  const hidden = HOME_SECTIONS.filter((s) => !order.includes(s.key));

  function move(index: number, direction: -1 | 1) {
    const next = [...order];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function hide(key: string) {
    onChange(order.filter((k) => k !== key));
  }

  function showSection(key: string) {
    onChange([...order, key]);
  }

  return (
    <div className="space-y-4">
      <ol className="space-y-2">
        {order.map((key, i) => {
          const section = HOME_SECTIONS.find((s) => s.key === key);
          if (!section) return null;

          return (
            <li
              key={key}
              className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs text-accent">
                {i + 1}
              </span>

              {/* min-w-0 so a long hint wraps instead of widening the row */}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{section.label}</span>
                <span className="text-xs text-muted">{section.hint}</span>
              </span>

              <span className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move ${section.label} up`}
                  className="rounded-lg p-2.5 text-muted hover:bg-surface hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent sm:p-1.5"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === order.length - 1}
                  aria-label={`Move ${section.label} down`}
                  className="rounded-lg p-2.5 text-muted hover:bg-surface hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent sm:p-1.5"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => hide(key)}
                  aria-label={`Hide ${section.label}`}
                  className="rounded-lg p-2.5 text-muted hover:bg-surface hover:text-foreground sm:p-1.5"
                >
                  <EyeOff className="h-4 w-4" />
                </button>
              </span>
            </li>
          );
        })}
      </ol>

      {hidden.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">Hidden sections</p>
          <div className="flex flex-wrap gap-2">
            {hidden.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => showSection(s.key)}
                className="flex items-center gap-2 rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <Eye className="h-3.5 w-3.5" /> {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
