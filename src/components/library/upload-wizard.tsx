"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadSchema, type UploadInput } from "@/lib/utils/validators";
import { createUpload, ingestDocument, putFileToSignedUrl } from "@/lib/api/documents";
import { useDocumentsStore } from "@/stores/documents-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadDropzone } from "./upload-dropzone";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import type { Document } from "@/types";
import { cn } from "@/lib/utils/cn";

export function UploadWizard({
  onSuccess,
  onCancel,
  embedded = false,
  initialDocument,
}: {
  onSuccess?: (doc: Document) => void;
  onCancel?: () => void;
  embedded?: boolean;
  initialDocument?: Pick<Document, "name" | "category" | "description">;
}) {
  const upsert = useDocumentsStore((s) => s.upsert);
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "uploading" | "ingesting">("form");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UploadInput>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      name: initialDocument?.name ?? "",
      category: initialDocument?.category ?? "",
      description: initialDocument?.description ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!file) {
      setFileError("Please select a file");
      return;
    }
    setFileError(null);
    try {
      setStep("uploading");
      const data = await createUpload({
        name: values.name,
        category: values.category,
        description: values.description,
        file_name: file.name,
      });
      await putFileToSignedUrl(data.upload_url, file);
      setStep("ingesting");
      await ingestDocument(data.document.id);
      upsert(data.document);
      toast({
        title: "Upload started",
        description: "We'll notify you when processing finishes.",
        variant: "success",
      });
      onSuccess?.(data.document);
    } catch (err) {
      setStep("form");
      toast({
        title: "Upload failed",
        description: err instanceof ApiError ? err.message : "Something went wrong",
        variant: "error",
      });
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className={cn("space-y-5", !embedded && "mx-auto max-w-xl")}
    >
      <Input label="Name" error={errors.name?.message} {...register("name")} />
      <Input
        label="Category"
        error={errors.category?.message}
        {...register("category")}
      />
      <Input label="Description (optional)" {...register("description")} />
      <UploadDropzone
        file={file}
        error={fileError}
        onFile={(f) => {
          setFile(f);
          setFileError(f ? null : "Please select a valid file");
        }}
      />
      <div className={cn("flex gap-2", embedded ? "justify-end" : "")}>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            disabled={step !== "form"}
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className={embedded ? undefined : "w-full"}
          disabled={isSubmitting || step !== "form"}
        >
          {step === "uploading"
            ? "Uploading file..."
            : step === "ingesting"
              ? "Queuing ingest..."
              : "Upload & Process"}
        </Button>
      </div>
    </form>
  );
}
