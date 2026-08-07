import { api } from "./client";
import type { CursorPage, Document, UploadResponse } from "@/types";
import { DEFAULT_PAGE_LIMIT } from "@/config/constants";

export interface DocumentFilters {
  limit?: number;
  cursor?: string | null;
  status?: string;
  category?: string;
  name?: string;
}

function toQuery(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function listDocuments(filters: DocumentFilters = {}) {
  return api.get<CursorPage<Document>>(
    `/documents${toQuery({
      limit: filters.limit ?? DEFAULT_PAGE_LIMIT,
      cursor: filters.cursor,
      status: filters.status,
      category: filters.category,
      name: filters.name,
    })}`,
  );
}

export function getDocument(id: string) {
  return api.get<Document>(`/documents/${id}`);
}

export function createUpload(body: {
  name: string;
  category: string;
  description?: string;
  file_name: string;
}) {
  return api.post<UploadResponse>("/documents/upload", body);
}

export async function putFileToSignedUrl(uploadUrl: string, file: File) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
  });
  if (!res.ok) {
    throw new Error(`Upload failed with status ${res.status}`);
  }
}

export function ingestDocument(id: string) {
  return api.post<{ document_id?: string }>(`/documents/${id}/ingest`);
}

export function retryIngest(id: string) {
  return api.post<{ document_id?: string }>(`/documents/${id}/ingest/retry`);
}

export function cancelIngest(id: string) {
  return api.patch<Document>(`/documents/${id}/ingest/cancel`);
}

export function updateDocument(
  id: string,
  body: Partial<Pick<Document, "name" | "description" | "category">>,
) {
  return api.patch<Document>(`/documents/${id}`, body);
}

export function deleteDocument(id: string) {
  return api.delete<null>(`/documents/${id}`);
}

/** Unwrapped `data` from GET /documents/download */
export type DownloadUrlResponse = {
  download_url: string;
};

export function getDownloadUrl(documentId: string) {
  return api.get<DownloadUrlResponse>(
    `/documents/download${toQuery({ document_id: documentId })}`,
  );
}

/** Pick the signed file URL from the download endpoint payload. */
export function resolveDownloadUrl(data: DownloadUrlResponse): string | null {
  const url = data.download_url?.trim();
  return url || null;
}
