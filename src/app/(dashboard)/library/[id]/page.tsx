"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  deleteDocument,
  getDocument,
  getDownloadUrl,
  retryIngest,
} from "@/lib/api/documents";
import { generateStudyCards } from "@/lib/api/study-cards";
import type { Document } from "@/types";
import { StatusBadge } from "@/components/library/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils/format";
import { routes } from "@/config/routes";
import { useDocumentsStore } from "@/stores/documents-store";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/layout/page-header";

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const upsert = useDocumentsStore((s) => s.upsert);
  const remove = useDocumentsStore((s) => s.remove);
  const storeDoc = useDocumentsStore((s) => s.items.find((d) => d.id === params.id));
  const [doc, setDoc] = useState<Document | null>(storeDoc ?? null);
  const [loading, setLoading] = useState(!storeDoc);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getDocument(params.id);
        if (!cancelled) {
          setDoc(data);
          upsert(data);
        }
      } catch (err) {
        if (!cancelled) {
          toast({
            title: "Failed to load document",
            description: err instanceof ApiError ? err.message : undefined,
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id, upsert, toast]);

  useEffect(() => {
    if (storeDoc) setDoc(storeDoc);
  }, [storeDoc]);

  if (loading || !doc) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const ready = doc.status === "completed";

  const onDownload = async () => {
    try {
      const data = await getDownloadUrl(doc.id);
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

  const onRetry = async () => {
    setBusy(true);
    try {
      await retryIngest(doc.id);
      toast({ title: "Retry queued", variant: "success" });
    } catch (err) {
      toast({
        title: "Retry failed",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  const onGenerateCards = async () => {
    setBusy(true);
    try {
      await generateStudyCards(doc.id);
      toast({
        title: "Study cards queued",
        description: "You'll be notified when they're ready.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Could not generate cards",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    setBusy(true);
    try {
      await deleteDocument(doc.id);
      remove(doc.id);
      toast({ title: "Document deleted", variant: "success" });
      router.push(routes.library);
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={doc.name}
        description={`Uploaded ${formatDate(doc.created_at)}`}
        backHref={routes.library}
        actions={<StatusBadge status={doc.status} />}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted">Category:</span> {doc.category}
          </p>
          {doc.sections != null && (
            <p>
              <span className="text-muted">Sections:</span> {doc.sections}
            </p>
          )}
          {doc.description && (
            <p>
              <span className="text-muted">Description:</span> {doc.description}
            </p>
          )}
          {doc.comment && (
            <p className="rounded-md bg-error/10 p-3 text-error">{doc.comment}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href={`${routes.chat}?docs=${doc.id}`}>
          <Button className="w-full" disabled={!ready}>
            Start Chat
          </Button>
        </Link>
        <Button
          className="w-full"
          variant="secondary"
          disabled={!ready || busy}
          onClick={onGenerateCards}
        >
          Generate Study Cards
        </Button>
        <Button className="w-full" variant="ghost" onClick={onDownload}>
          Download
        </Button>
        {doc.status === "failed" && (
          <Button className="w-full" variant="secondary" disabled={busy} onClick={onRetry}>
            Retry ingest
          </Button>
        )}
        <Link href={routes.studyDeck(doc.id)}>
          <Button className="w-full" variant="ghost" disabled={!ready}>
            Open Study Deck
          </Button>
        </Link>
        <Button
          className="w-full"
          variant="danger"
          onClick={() => setConfirmDelete(true)}
        >
          Delete
        </Button>
      </div>

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
    </div>
  );
}
