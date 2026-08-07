"use client";

import { useCallback, useState } from "react";
import { cancelIngest } from "@/lib/api/documents";
import { ApiError } from "@/lib/api/client";
import { useDocumentsStore } from "@/stores/documents-store";
import { useToast } from "@/components/ui/toast";
import type { Document } from "@/types";

export function useCancelIngest() {
  const upsert = useDocumentsStore((state) => state.upsert);
  const { toast } = useToast();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const cancel = useCallback(
    async (documentId: string): Promise<Document | null> => {
      setCancellingId(documentId);
      try {
        const updated = await cancelIngest(documentId);
        upsert(updated);
        toast({ title: "Ingestion cancelled", variant: "success" });
        return updated;
      } catch (error) {
        toast({
          title: "Could not cancel ingestion",
          description: error instanceof ApiError ? error.message : undefined,
          variant: "error",
        });
        return null;
      } finally {
        setCancellingId(null);
      }
    },
    [toast, upsert],
  );

  return {
    cancel,
    isCancelling: (documentId: string) => cancellingId === documentId,
  };
}
