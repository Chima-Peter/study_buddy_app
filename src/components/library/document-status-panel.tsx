"use client";

import { useState } from "react";
import { Loader2, RefreshCw, Upload, XCircle } from "lucide-react";
import type { Document } from "@/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { useRetryIngest } from "@/lib/hooks/use-retry-ingest";
import { useCancelIngest } from "@/lib/hooks/use-cancel-ingest";

export function DocumentStatusPanel({
  document,
  onRetried,
  onCancelled,
  onUploadAgain,
}: {
  document: Document;
  onRetried?: (doc: Document) => void;
  onCancelled?: (doc: Document) => void;
  onUploadAgain?: () => void;
}) {
  const { retry, isRetrying } = useRetryIngest();
  const { cancel, isCancelling } = useCancelIngest();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const retrying = isRetrying(document.id);
  const cancelling = isCancelling(document.id);

  if (document.status === "pending" || document.status === "processing") {
    return (
      <>
        <div className="flex flex-col gap-3 rounded-lg border border-primary-500/30 bg-primary-500/10 p-4 sm:flex-row sm:items-start">
          <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-primary-700" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              {document.status === "pending"
                ? "Queued for processing"
                : "Processing your document"}
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              This usually takes a minute. You can leave this page — we&apos;ll
              notify you when it&apos;s ready.
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="shrink-0 text-error hover:bg-error/10 hover:text-error"
            onClick={() => setConfirmCancel(true)}
          >
            <XCircle className="h-3.5 w-3.5" />
            Cancel ingest
          </Button>
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
                if (updated) {
                  onCancelled?.(updated);
                  setConfirmCancel(false);
                }
              }}
            >
              {cancelling ? "Cancelling..." : "Cancel ingestion"}
            </Button>
          </div>
        </Modal>
      </>
    );
  }

  if (document.status === "failed") {
    return (
      <div className="space-y-3 rounded-lg border border-error/30 bg-error/10 p-4">
        <div>
          <p className="text-sm font-medium text-error">Processing failed</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {document.comment ||
              "Something went wrong while ingesting this document."}
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          disabled={retrying}
          onClick={async () => {
            const updated = await retry(document.id);
            if (updated) onRetried?.(updated);
          }}
        >
          {retrying ? (
            <Spinner className="h-3.5 w-3.5 border-primary-700 border-t-transparent" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Retry ingest
        </Button>
      </div>
    );
  }

  if (document.status === "cancelled") {
    return (
      <div className="space-y-3 rounded-lg border border-border bg-surface-tertiary p-4">
        <div>
          <p className="text-sm font-medium">Processing cancelled</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            This document wasn&apos;t fully processed. Upload the file again to
            start a new ingest.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={onUploadAgain}>
          <Upload className="h-3.5 w-3.5" />
          Upload again
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-success/30 bg-success/10 p-4">
      <p className="text-sm font-medium text-success">
        Ready to use
      </p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Your document was processed successfully and is ready for chat and study
        cards.
      </p>
    </div>
  );
}
