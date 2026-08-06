"use client";

import { useEffect, useRef } from "react";
import { NotificationStream } from "./notification-stream";
import { useSessionStore } from "@/stores/session-store";
import { useDocumentsStore } from "@/stores/documents-store";
import { useStudyStore } from "@/stores/study-store";
import { useNotificationsStore } from "@/stores/notifications-store";
import { useToast } from "@/components/ui/toast";
import type { DocumentStatus, SseEvent } from "@/types";
import { getStudyCards } from "@/lib/api/study-cards";

type ServerNotice = {
  content?: string | null;
  comment?: string | null;
  status?: string | null;
};

function toastFromServer(
  toast: (item: {
    title: string;
    description?: string;
    variant?: "default" | "success" | "error";
  }) => void,
  data: ServerNotice,
) {
  const content = (data.content ?? data.comment)?.trim();
  if (!content) return;

  const status = data.status;
  const variant =
    status === "failed" || status === "error"
      ? ("error" as const)
      : status === "completed" || status === "success"
        ? ("success" as const)
        : ("default" as const);

  toast({ title: content, variant });
}

export function useSse() {
  const token = useSessionStore((s) => s.token);
  const { toast } = useToast();
  const streamRef = useRef<NotificationStream | null>(null);
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    if (!token) {
      streamRef.current?.stop();
      streamRef.current = null;
      return;
    }

    const handleEvent = async (event: SseEvent) => {
      if (event.type === "document.status") {
        const data = event.data as {
          id?: string;
          document_id?: string;
          name?: string | null;
          status?: DocumentStatus;
          comment?: string | null;
          title?: string | null;
          content?: string | null;
        };
        const id = data.id ?? data.document_id;
        if (id && data.status) {
          useDocumentsStore.getState().updateStatus(id, data.status, data.comment);
        }
        useNotificationsStore.getState().incrementUnread();
        toastFromServer(toastRef.current, data);
        return;
      }

      if (event.type === "study_cards_generated") {
        const data = event.data as {
          document_id?: string;
          name?: string | null;
          status?: string | null;
          comment?: string | null;
          title?: string | null;
          content?: string | null;
        };
        if (data.document_id) {
          try {
            const deck = await getStudyCards(data.document_id);
            useStudyStore.getState().upsert(deck);
          } catch {
            useStudyStore.getState().upsert({
              id: data.document_id,
              document_id: data.document_id,
              document_name: data.name ?? "",
              status: "success",
              result: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }
        useNotificationsStore.getState().incrementUnread();
        toastFromServer(toastRef.current, data);
        return;
      }

      if (event.type === "study_cards_failed") {
        const data = event.data as {
          document_id?: string;
          name?: string | null;
          status?: string | null;
          comment?: string | null;
          title?: string | null;
          content?: string | null;
        };
        if (data.document_id) {
          useStudyStore.getState().upsert({
            id: data.document_id,
            document_id: data.document_id,
            document_name: data.name ?? "",
            status: "failed",
            result: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        useNotificationsStore.getState().incrementUnread();
        toastFromServer(toastRef.current, data);
      }
    };

    const stream = new NotificationStream(
      () => useSessionStore.getState().token,
      handleEvent,
    );
    streamRef.current = stream;
    stream.start();

    return () => {
      stream.stop();
      streamRef.current = null;
    };
  }, [token]);
}
