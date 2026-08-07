"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Document } from "@/types";
import { updateDocument } from "@/lib/api/documents";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";

const editSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  category: z.string().min(3, "Category must be at least 3 characters"),
  description: z.string().optional(),
});

type EditInput = z.infer<typeof editSchema>;

export function DocumentEditForm({
  document,
  onSaved,
  onCancel,
}: {
  document: Document;
  onSaved: (doc: Document) => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditInput>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: document.name,
      category: document.category,
      description: document.description ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: document.name,
      category: document.category,
      description: document.description ?? "",
    });
  }, [document, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const updated = await updateDocument(document.id, {
        name: values.name,
        category: values.category,
        description: values.description || undefined,
      });
      onSaved(updated);
      toast({ title: "Document updated", variant: "success" });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input label="Name" error={errors.name?.message} {...register("name")} />
      <Input
        label="Category"
        error={errors.category?.message}
        {...register("category")}
      />
      <Input label="Description (optional)" {...register("description")} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
