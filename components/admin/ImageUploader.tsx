"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageUploader({
  images,
  onChange,
  kind = "site-image",
  hint = "Add as many as you like.",
}: {
  images: string[];
  onChange: (images: string[]) => void;
  kind?: "site-image" | "model-image";
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    const list = Array.from(files);
    setProgress({ done: 0, total: list.length });

    const uploaded: string[] = [];
    const failures: string[] = [];

    for (const [i, file] of list.entries()) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      setProgress({ done: i + 1, total: list.length });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        failures.push(`${file.name}: ${data.error ?? "upload failed"}`);
        continue;
      }

      uploaded.push((await res.json()).url);
    }

    setUploading(false);
    setProgress(null);
    if (failures.length > 0) setError(failures.join(" · "));
    if (uploaded.length > 0) onChange([...images, ...uploaded]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div
            key={url}
            className="group relative h-28 w-28 overflow-hidden rounded-lg border border-border bg-background"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />

            <button
              type="button"
              onClick={() => onChange(images.filter((x) => x !== url))}
              aria-label="Remove photo"
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-red-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Always visible on touch — there is no hover on a phone, so a
                hover-only control means the owner cannot reorder at all. */}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Move earlier"
                className="p-2 text-white disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === images.length - 1}
                aria-label="Move later"
                className="p-2 text-white disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted transition-colors hover:border-accent hover:text-accent">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          <span className="text-xs">{uploading ? "Uploading…" : "Add photos"}</span>
          {progress && (
            <span className="text-[10px]">
              {progress.done}/{progress.total}
            </span>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      <p className="mt-2 text-xs text-muted">
        {hint} Use the arrows on a photo to reorder it. JPEG, PNG, WebP or AVIF — up to 5 MB each.
      </p>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
