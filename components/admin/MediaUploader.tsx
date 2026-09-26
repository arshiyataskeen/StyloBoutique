"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";

export default function MediaUploader({
  kind,
  accept,
  value,
  onChange,
  previewType = "image",
  fit = "cover",
  compact = false,
}: {
  kind: "site-image" | "site-video" | "model-image";
  accept: string;
  value: string;
  onChange: (url: string) => void;
  previewType?: "image" | "video";
  /** "contain" keeps a wide logo whole instead of cropping its edges off. */
  fit?: "cover" | "contain";
  compact?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });

    setUploading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Upload failed");
      return;
    }

    const data = await res.json();
    onChange(data.url);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      {value && (
        <div
          className={`relative mb-3 w-full max-w-sm overflow-hidden rounded-lg border border-border ${
            fit === "contain" ? "bg-background p-2" : ""
          }`}
        >
          {previewType === "video" ? (
            <video
              src={value}
              className={`w-full ${compact ? "h-24" : "h-40"} ${
                fit === "contain" ? "object-contain" : "object-cover"
              }`}
              muted
              loop
              autoPlay
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className={`w-full ${compact ? "h-24" : "h-40"} ${
                fit === "contain" ? "object-contain" : "object-cover"
              }`}
            />
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted hover:border-accent hover:text-accent">
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {value ? "Replace" : "Upload"}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files)}
        />
      </label>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
