"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDocumentsStore } from "@/stores/documents-store";
import { listDocuments } from "@/lib/api/documents";
import { DocumentFilters } from "@/components/library/document-filters";
import { DocumentGrid } from "@/components/library/document-grid";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { Plus } from "lucide-react";

export default function LibraryPage() {
  const { items, hasMore, nextCursor, setPage } = useDocumentsStore();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My Library</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Upload and manage your study materials
          </p>
        </div>
        <Link href={routes.libraryUpload}>
          <Button>
            <Plus className="h-4 w-4" />
            Upload
          </Button>
        </Link>
      </div>

      <DocumentFilters
        name={name}
        category={category}
        status={status}
        onNameChange={setName}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
      />

      <DocumentGrid documents={items} loading={loading} />

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
