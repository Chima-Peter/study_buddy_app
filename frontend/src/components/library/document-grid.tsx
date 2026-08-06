"use client";

import { DocumentCard } from "./document-card";
import type { Document } from "@/types";
import { Skeleton } from "@/components/ui/spinner";

export function DocumentGrid({
  documents,
  loading,
}: {
  documents: Document[];
  loading?: boolean;
}) {
  if (loading && documents.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-44" />
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}
