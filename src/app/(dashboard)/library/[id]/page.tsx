"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ExternalLink, FileText, FolderOpen, Layers, Pencil } from "lucide-react";
import {
  deleteDocument,
  getDocument,
  getDownloadUrl,
  resolveDownloadUrl,
} from "@/lib/api/documents";
import type { Document } from "@/types";
import { StatusBadge } from "@/components/library/status-badge";
import { DocumentStatusPanel } from "@/components/library/document-status-panel";
import { DocumentEditForm } from "@/components/library/document-edit-form";
import { UploadModal } from "@/components/library/upload-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageLoader } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils/format";
import { routes } from "@/config/routes";
import { useDocumentsStore } from "@/stores/documents-store";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/layout/page-header";

function normalizeSections(
  sections: Document["sections"],
): string[] {
  if (sections == null) return [];
  if (typeof sections === "number") return [String(sections)];
  if (Array.isArray(sections)) {
    return sections.map((s) => String(s).trim()).filter(Boolean);
  }
  return String(sections)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatSectionLabel(section: string) {
  return section
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

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
  const [uploadOpen, setUploadOpen] = useState(false);

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [viewLoaded, setViewLoaded] = useState(false);

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

  const loadViewUrl = async () => {
    if (viewLoaded || viewLoading) return;
    setViewLoading(true);
    setViewError(null);
    try {
      const data = await getDownloadUrl(params.id);
      const url = resolveDownloadUrl(data);
      if (!url) {
        setViewError("No view link was returned for this document.");
        return;
      }
      setFileUrl(url);
    } catch (err) {
      setViewError(
        err instanceof ApiError
          ? err.message
          : "Could not load the document view link.",
      );
    } finally {
      setViewLoading(false);
      setViewLoaded(true);
    }
  };

  if (loading || !doc) {
    return (
      <div className="flex justify-center py-20">
        <PageLoader label="Loading document" />
      </div>
    );
  }

  const ready = doc.status === "completed";
  const notReady = !ready;
  const sectionItems = normalizeSections(doc.sections);

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
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-4">
      <PageHeader
        title={doc.name}
        description={`Uploaded ${formatDate(doc.created_at)}`}
        showBack
        backHref={routes.library}
        actions={<StatusBadge status={doc.status} />}
      />

      {notReady && (
        <DocumentStatusPanel
          document={doc}
          onRetried={(updated) => {
            setDoc(updated);
            setEditing(false);
          }}
          onCancelled={(updated) => {
            setDoc(updated);
            setEditing(false);
          }}
          onUploadAgain={() => setUploadOpen(true)}
        />
      )}

      <Tabs
        defaultValue="details"
        onValueChange={(v) => {
          if (v === "view" && ready) loadViewUrl();
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          {ready && <TabsTrigger value="view">View</TabsTrigger>}
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4 space-y-4">
          <div className="overflow-hidden rounded-xl border border-border bg-surface-secondary">
            <div className="flex items-start justify-between gap-3 border-b border-border bg-primary-700/[0.04] px-5 py-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-700/10 text-primary-800">
                  <FileText className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {doc.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    Uploaded {formatDate(doc.created_at)}
                  </p>
                </div>
              </div>
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
            </div>

            <div className="p-5">
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
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                      <FolderOpen className="h-3.5 w-3.5" />
                      Category
                    </span>
                    <Badge variant="primary" className="capitalize">
                      {doc.category}
                    </Badge>
                  </div>

                  {doc.description && (
                    <div className="rounded-lg border border-primary-700/10 bg-primary-700/[0.03] px-4 py-3">
                      <p className="text-xs font-medium text-muted">
                        Description
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                        {doc.description}
                      </p>
                    </div>
                  )}

                  {sectionItems.length > 0 && (
                    <div>
                      <div className="mb-2.5 flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-primary-700" />
                        <p className="text-xs font-medium text-muted">
                          Sections
                        </p>
                        <Badge variant="outline" className="ml-auto">
                          {sectionItems.length}
                        </Badge>
                      </div>
                      <ol className="overflow-hidden rounded-lg border border-border">
                        {sectionItems.map((section, index) => (
                          <li
                            key={section}
                            className="flex items-center gap-3 border-b border-border px-3.5 py-2.5 last:border-b-0"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-700/10 text-[11px] font-semibold text-primary-800">
                              {index + 1}
                            </span>
                            <span className="text-sm text-[var(--text-primary)]">
                              {formatSectionLabel(section)}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {ready && (
          <TabsContent
            value="view"
            className="mt-4 flex min-h-0 flex-1 flex-col"
          >
            {viewLoading && (
              <div className="flex flex-1 items-center justify-center">
                <PageLoader label="Loading document preview" />
              </div>
            )}
            {!viewLoading && viewError && (
              <div className="rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
                {viewError}
              </div>
            )}
            {!viewLoading && fileUrl && (
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <div className="flex justify-end">
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open in new tab
                    </Button>
                  </a>
                </div>
                <iframe
                  title={doc.name}
                  src={fileUrl}
                  className="min-h-[28rem] w-full flex-1 rounded-lg border border-border bg-white"
                />
              </div>
            )}
          </TabsContent>
        )}

        <TabsContent value="settings" className="mt-4 space-y-4">
          <div className="rounded-lg border border-border bg-white p-5">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Delete document
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Permanently remove this document and related study data. This
              action cannot be undone.
            </p>
            <Button
              className="mt-4"
              variant="danger"
              size="sm"
              onClick={() => setConfirmDelete(true)}
            >
              Delete document
            </Button>
          </div>
        </TabsContent>
      </Tabs>

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

      <UploadModal
        open={uploadOpen}
        initialDocument={doc}
        onOpenChange={setUploadOpen}
      />
    </div>
  );
}
