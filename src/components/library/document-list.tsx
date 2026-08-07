"use client";

import { DocumentRow } from "./document-row";
import type { Document } from "@/types";
import { Spinner } from "@/components/ui/spinner";

export function DocumentList({
  documents,
  loading,
  onUploadAgain,
}: {
  documents: Document[];
  loading?: boolean;
  onUploadAgain?: (document: Document) => void;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-lg font-medium">No documents yet</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Upload lecture materials to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {documents.map((doc) => (
        <DocumentRow
          key={doc.id}
          document={doc}
          onUploadAgain={() => onUploadAgain?.(doc)}
        />
      ))}
    </div>
  );
}
