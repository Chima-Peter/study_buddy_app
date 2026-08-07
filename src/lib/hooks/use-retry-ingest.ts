"use client";

import { useState, useCallback } from "react";
import { getDocument, retryIngest } from "@/lib/api/documents";
import { useDocumentsStore } from "@/stores/documents-store";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import type { Document } from "@/types";

export function useRetryIngest() {
  const upsert = useDocumentsStore((s) => s.upsert);
  const { toast } = useToast();
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const retry = useCallback(
    async (documentId: string): Promise<Document | null> => {
      setRetryingId(documentId);
      try {
        await retryIngest(documentId);
        const updated = await getDocument(documentId);
        upsert(updated);
        toast({ title: "Retry queued", variant: "success" });
        return updated;
      } catch (err) {
        toast({
          title: "Retry failed",
          description: err instanceof ApiError ? err.message : undefined,
          variant: "error",
        });
        return null;
      } finally {
        setRetryingId(null);
      }
    },
    [upsert, toast],
  );

  return {
    retry,
    retryingId,
    isRetrying: (id: string) => retryingId === id,
  };
}
