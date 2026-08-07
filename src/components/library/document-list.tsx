"use client";

import { DocumentRow } from "./document-row";
import type { Document } from "@/types";
import { Skeleton } from "@/components/ui/spinner";

export function DocumentList({
  documents,
  loading,
  onUploadAgain,
}: {
  documents: Document[];
  loading?: boolean;
  onUploadAgain?: () => void;
}) {
  if (loading && documents.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-surface-secondary">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-b-0"
          >
            <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40 max-w-[50%]" />
              <Skeleton className="h-3 w-24 max-w-[30%]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!loading && documents.length === 0) {
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
    <div className="overflow-hidden rounded-lg border border-border bg-surface-secondary">
      {documents.map((doc) => (
        <DocumentRow
          key={doc.id}
          document={doc}
          onUploadAgain={onUploadAgain}
        />
      ))}
    </div>
  );
}
