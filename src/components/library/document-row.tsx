"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Download,
  FileText,
  MessageSquare,
  BookOpen,
  RefreshCw,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import type { Document } from "@/types";
import { StatusBadge } from "./status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils/format";
import { routes } from "@/config/routes";
import { deleteDocument, getDownloadUrl } from "@/lib/api/documents";
import { useDocumentsStore } from "@/stores/documents-store";
import { useRetryIngest } from "@/lib/hooks/use-retry-ingest";
import { useCancelIngest } from "@/lib/hooks/use-cancel-ingest";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

export function DocumentRow({
  document,
  onUploadAgain,
}: {
  document: Document;
  onUploadAgain?: () => void;
}) {
  const { toast } = useToast();
  const remove = useDocumentsStore((s) => s.remove);
  const { retry, isRetrying } = useRetryIngest();
  const { cancel, isCancelling } = useCancelIngest();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  const retrying = isRetrying(document.id);
  const cancelling = isCancelling(document.id);
  const ready = document.status === "completed";
  const failed = document.status === "failed";
  const cancelled = document.status === "cancelled";
  const inPipeline =
    document.status === "pending" || document.status === "processing";

  const onDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const data = await getDownloadUrl(document.id);
      const url =
        "download_url" in data
          ? data.download_url
          : "url" in data
            ? data.url
            : null;
      if (url) window.open(url, "_blank");
    } catch (err) {
      toast({
        title: "Download failed",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    }
  };

  const onRetry = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await retry(document.id);
  };

  const onDelete = async () => {
    setBusy(true);
    try {
      await deleteDocument(document.id);
      remove(document.id);
      toast({ title: "Document deleted", variant: "success" });
      setConfirmDelete(false);
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "group flex flex-col gap-3 border-b border-border px-3 py-3.5 transition-colors last:border-b-0",
          "hover:bg-surface-tertiary/60 sm:flex-row sm:items-center sm:gap-4 sm:px-4",
        )}
      >
        <Link
          href={routes.libraryDetail(document.id)}
          className="flex min-w-0 flex-1 items-start gap-3"
        >
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-500/15 text-primary-700">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {document.name}
              </h3>
              <StatusBadge status={document.status} />
              <Badge variant="outline" className="font-normal">
                {document.category}
              </Badge>
            </div>
            {failed && document.comment && (
              <p className="line-clamp-1 text-xs text-error">{document.comment}</p>
            )}
            {!failed && document.description && (
              <p className="line-clamp-1 text-xs text-[var(--text-secondary)]">
                {document.description}
              </p>
            )}
            <p className="text-xs text-muted">{formatDate(document.created_at)}</p>
          </div>
        </Link>

        <div
          className="flex flex-wrap items-center gap-1.5 sm:shrink-0 sm:justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          {failed && (
            <Button
              size="sm"
              variant="secondary"
              disabled={retrying}
              onClick={onRetry}
              aria-label="Retry ingest"
            >
              {retrying ? (
                <Spinner className="h-3.5 w-3.5 border-primary-700 border-t-transparent" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Retry
            </Button>
          )}
          {inPipeline && (
            <Button
              size="sm"
              variant="ghost"
              className="text-error hover:bg-error/10 hover:text-error"
              disabled={cancelling}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setConfirmCancel(true);
              }}
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel ingest
            </Button>
          )}
          {cancelled && (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUploadAgain?.();
              }}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload again
            </Button>
          )}
          {ready && (
            <>
              <Link href={`${routes.chat}?docs=${document.id}`}>
                <Button size="sm" variant="ghost" aria-label="Start chat">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Chat</span>
                </Button>
              </Link>
              <Link href={routes.studyDeck(document.id)}>
                <Button size="sm" variant="ghost" aria-label="Open study deck">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Study</span>
                </Button>
              </Link>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onDownload}
            aria-label="Download"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-error hover:bg-error/10 hover:text-error"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setConfirmDelete(true);
            }}
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Modal
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel ingestion?"
        description="Processing will stop. You can upload the document again with the same details."
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmCancel(false)}>
            Keep processing
          </Button>
          <Button
            variant="danger"
            disabled={cancelling}
            onClick={async () => {
              const updated = await cancel(document.id);
              if (updated) setConfirmCancel(false);
            }}
          >
            {cancelling ? "Cancelling..." : "Cancel ingestion"}
          </Button>
        </div>
      </Modal>

      <Modal
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete document?"
        description="This permanently removes the document and related data."
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" disabled={busy} onClick={onDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
