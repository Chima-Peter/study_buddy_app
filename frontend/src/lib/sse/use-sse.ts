"use client";

import { useEffect, useRef } from "react";
import { NotificationStream } from "./notification-stream";
import { useSessionStore } from "@/stores/session-store";
import { useDocumentsStore } from "@/stores/documents-store";
import { useStudyStore } from "@/stores/study-store";
import { useNotificationsStore } from "@/stores/notifications-store";
import type { DocumentStatus, SseEvent } from "@/types";
import { getStudyCards } from "@/lib/api/study-cards";

export function useSse() {
  const token = useSessionStore((s) => s.token);
  const streamRef = useRef<NotificationStream | null>(null);

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
          status?: DocumentStatus;
          comment?: string | null;
        };
        const id = data.id ?? data.document_id;
        if (id && data.status) {
          useDocumentsStore.getState().updateStatus(id, data.status, data.comment);
        }
        useNotificationsStore.getState().incrementUnread();
        return;
      }

      if (event.type === "study_cards_generated") {
        const data = event.data as { document_id?: string };
        if (data.document_id) {
          try {
            const deck = await getStudyCards(data.document_id);
            useStudyStore.getState().upsert(deck);
          } catch {
            useStudyStore.getState().upsert({
              id: data.document_id,
              document_id: data.document_id,
              status: "success",
              result: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }
        useNotificationsStore.getState().incrementUnread();
        return;
      }

      if (event.type === "study_cards_failed") {
        const data = event.data as { document_id?: string };
        if (data.document_id) {
          useStudyStore.getState().upsert({
            id: data.document_id,
            document_id: data.document_id,
            status: "failed",
            result: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        useNotificationsStore.getState().incrementUnread();
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
