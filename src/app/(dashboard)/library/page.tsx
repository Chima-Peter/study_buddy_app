"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useDocumentsStore } from "@/stores/documents-store";
import { listDocuments } from "@/lib/api/documents";
import { DocumentFilters } from "@/components/library/document-filters";
import { DocumentList } from "@/components/library/document-list";
import { UploadModal } from "@/components/library/upload-modal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/layout/page-header";
import type { Document } from "@/types";

export default function LibraryPage() {
  const { items, hasMore, nextCursor, setPage } = useDocumentsStore();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadSource, setUploadSource] = useState<Document | null>(null);

  const openUpload = (document: Document | null = null) => {
    setUploadSource(document);
    setUploadOpen(true);
  };

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await listDocuments({
          name: name || undefined,
          category: category || undefined,
          status: status || undefined,
        });
        if (!cancelled) setPage(data.items, data.next_cursor, data.has_more);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [name, category, status, setPage]);

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const data = await listDocuments({
        cursor: nextCursor,
        name: name || undefined,
        category: category || undefined,
        status: status || undefined,
      });
      setPage(data.items, data.next_cursor, data.has_more, true);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Library"
        description="Upload and manage your study materials"
        actions={
          <Button className="w-full sm:w-auto" onClick={() => openUpload()}>
            <Plus className="h-4 w-4" />
            Upload
          </Button>
        }
      />

      <DocumentFilters
        name={name}
        category={category}
        status={status}
        onNameChange={setName}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
      />

      <DocumentList
        documents={items}
        loading={loading}
        onUploadAgain={openUpload}
      />

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={loadMore} disabled={loadingMore}>
            {loadingMore && <Spinner className="h-3.5 w-3.5" />}
            {loadingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}

      <UploadModal
        open={uploadOpen}
        initialDocument={uploadSource}
        onOpenChange={(open) => {
          setUploadOpen(open);
          if (!open) setUploadSource(null);
        }}
      />
    </div>
  );
}
