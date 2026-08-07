"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Pencil } from "lucide-react";
import {
  deleteDocument,
  getDocument,
  getDownloadUrl,
} from "@/lib/api/documents";
import { generateStudyCards } from "@/lib/api/study-cards";
import type { Document } from "@/types";
import { StatusBadge } from "@/components/library/status-badge";
import { DocumentStatusPanel } from "@/components/library/document-status-panel";
import { DocumentEditForm } from "@/components/library/document-edit-form";
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
  const storeDoc = useDocumentsStore((s) =>
    s.items.find((d) => d.id === params.id),
  );
  const [doc, setDoc] = useState<Document | null>(storeDoc ?? null);
  const [loading, setLoading] = useState(!storeDoc);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

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
        showBack
        backHref={routes.library}
        actions={<StatusBadge status={doc.status} />}
      />

      <DocumentStatusPanel
        document={doc}
        onRetried={(updated) => {
          setDoc(updated);
          setEditing(false);
        }}
      />

      <Card>
        <CardHeader className="mb-3 flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Details</CardTitle>
          {!editing && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editing ? (
            <DocumentEditForm
              document={doc}
              onCancel={() => setEditing(false)}
              onSaved={(updated) => {
                setDoc(updated);
                upsert(updated);
                setEditing(false);
              }}
            />
          ) : (
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted">Category</dt>
                <dd className="mt-0.5">{doc.category}</dd>
              </div>
              {doc.sections != null && (
                <div>
                  <dt className="text-muted">Sections</dt>
                  <dd className="mt-0.5">{doc.sections}</dd>
                </div>
              )}
              {doc.description && (
                <div>
                  <dt className="text-muted">Description</dt>
                  <dd className="mt-0.5 text-[var(--text-secondary)]">
                    {doc.description}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </CardContent>
      </Card>

      {ready && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            Study actions
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href={`${routes.chat}?docs=${doc.id}`}>
              <Button className="w-full">Start Chat</Button>
            </Link>
            <Button
              className="w-full"
              variant="secondary"
              disabled={busy}
              onClick={onGenerateCards}
            >
              Generate Study Cards
            </Button>
            <Link href={routes.studyDeck(doc.id)} className="sm:col-span-2">
              <Button className="w-full" variant="ghost">
                Open Study Deck
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Button variant="ghost" onClick={onDownload}>
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      <div className="rounded-lg border border-error/20 p-4">
        <p className="text-sm font-medium">Danger zone</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Permanently remove this document and related study data.
        </p>
        <Button
          className="mt-3"
          variant="danger"
          size="sm"
          onClick={() => setConfirmDelete(true)}
        >
          Delete document
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
