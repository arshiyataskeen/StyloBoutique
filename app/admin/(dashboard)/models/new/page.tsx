"use client";

import { useRouter } from "next/navigation";
import ModelForm, { ModelFormValues } from "@/components/admin/ModelForm";

export default function NewModelPage() {
  const router = useRouter();

  async function handleSubmit(values: ModelFormValues) {
    const res = await fetch("/api/admin/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Something went wrong");
    }

    router.push("/admin/models");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-2xl sm:text-3xl">New Model</h1>
      <div className="mt-6">
        <ModelForm onSubmit={handleSubmit} submitLabel="Create Model" />
      </div>
    </div>
  );
}
