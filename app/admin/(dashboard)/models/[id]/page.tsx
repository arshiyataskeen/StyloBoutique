"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ModelForm, { ModelFormValues } from "@/components/admin/ModelForm";
import { resolvePriceDisplay } from "@/lib/pricing";
import type { ModelDTO } from "@/lib/types";

export default function EditModelPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<Partial<ModelFormValues> | null>(null);

  useEffect(() => {
    fetch(`/api/admin/models/${id}`)
      .then((r) => r.json())
      .then((d) => {
        const model: ModelDTO = d.model;
        setInitialValues({
          name: model.name,
          category: typeof model.category === "string" ? model.category : model.category.id,
          description: model.description,
          price: model.price,
          priceNote: model.priceNote ?? "",
          priceDisplay: resolvePriceDisplay(model.priceDisplay),
          images: model.images,
          isActive: model.isActive,
          isFeatured: model.isFeatured,
          displayOrder: model.displayOrder,
        });
      });
  }, [id]);

  async function handleSubmit(values: ModelFormValues) {
    const res = await fetch(`/api/admin/models/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Something went wrong");
    }

    router.push("/admin/models");
  }

  if (!initialValues) return <p className="text-muted">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-2xl sm:text-3xl">Edit Model</h1>
      <div className="mt-6">
        <ModelForm initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Save Changes" />
      </div>
    </div>
  );
}
