"use client";

import type { CopyItem, SectionContent } from "@/lib/types";

const input =
  "w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent";

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted">{label}</label>
      {textarea ? (
        <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} className={input} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={input} />
      )}
    </div>
  );
}

function CardList({
  items,
  onChange,
  noun,
}: {
  items: CopyItem[];
  onChange: (next: CopyItem[]) => void;
  noun: string;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-border bg-background p-3">
          <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-muted">
            {noun} {i + 1}
          </p>
          <div className="space-y-2">
            <input
              value={item.title}
              onChange={(e) =>
                onChange(items.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))
              }
              placeholder="Title"
              className={input}
            />
            <textarea
              rows={2}
              value={item.description}
              onChange={(e) =>
                onChange(
                  items.map((x, idx) => (idx === i ? { ...x, description: e.target.value } : x))
                )
              }
              placeholder="Description"
              className={input}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SectionCopyEditor({
  value,
  onChange,
}: {
  value: SectionContent;
  onChange: (next: SectionContent) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Short group first, across the full width — pairing it beside the two
          tall ones would leave a large gap under it. */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Featured designs</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Heading"
            value={value.featured.heading}
            onChange={(heading) => onChange({ ...value, featured: { ...value.featured, heading } })}
          />
          <Field
            label="Link label"
            value={value.featured.ctaLabel}
            onChange={(ctaLabel) =>
              onChange({ ...value, featured: { ...value.featured, ctaLabel } })
            }
          />
        </div>
      </div>

      {/* Three equal fields fill the row exactly, so no hole is left beside them. */}
      <div className="space-y-3 border-t border-border pt-6">
        <p className="text-sm font-medium">Instagram</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field
            label="Small label above the heading"
            value={value.instagram.eyebrow}
            onChange={(eyebrow) =>
              onChange({ ...value, instagram: { ...value.instagram, eyebrow } })
            }
          />
          <Field
            label="Heading"
            value={value.instagram.heading}
            onChange={(heading) =>
              onChange({ ...value, instagram: { ...value.instagram, heading } })
            }
          />
          <Field
            label="Subheading"
            value={value.instagram.subheading}
            onChange={(subheading) =>
              onChange({ ...value, instagram: { ...value.instagram, subheading } })
            }
          />
        </div>
        <p className="text-xs text-muted">
          This section only appears once you&apos;ve entered your handle under Footer.
        </p>
      </div>

      <div className="grid items-start gap-6 border-t border-border pt-6 lg:grid-cols-2">
      <div className="space-y-3">
        <p className="text-sm font-medium">Quick links</p>
        <Field
          label="Heading"
          value={value.quickLinks.heading}
          onChange={(heading) =>
            onChange({ ...value, quickLinks: { ...value.quickLinks, heading } })
          }
        />
        <Field
          label="Subheading"
          value={value.quickLinks.subheading}
          onChange={(subheading) =>
            onChange({ ...value, quickLinks: { ...value.quickLinks, subheading } })
          }
        />
        <CardList
          noun="Card"
          items={value.quickLinks.items}
          onChange={(items) => onChange({ ...value, quickLinks: { ...value.quickLinks, items } })}
        />
        <p className="text-xs text-muted">
          The four cards always link to Catalog, Book, Track and Contact — only the wording changes.
        </p>
      </div>

      <div className="space-y-3 border-t border-border pt-5 lg:border-t-0 lg:pt-0">
        <p className="text-sm font-medium">How it works</p>
        <Field
          label="Small label above the heading"
          value={value.process.eyebrow}
          onChange={(eyebrow) => onChange({ ...value, process: { ...value.process, eyebrow } })}
        />
        <Field
          label="Heading"
          value={value.process.heading}
          onChange={(heading) => onChange({ ...value, process: { ...value.process, heading } })}
        />
        <CardList
          noun="Step"
          items={value.process.steps}
          onChange={(steps) => onChange({ ...value, process: { ...value.process, steps } })}
        />
      </div>
      </div>
    </div>
  );
}
