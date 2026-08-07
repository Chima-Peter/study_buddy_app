"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getStudyCards } from "@/lib/api/study-cards";
import { useStudyStore } from "@/stores/study-store";
import type { StudyCards } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";

function deckFromStore(documentId: string): StudyCards | null {
  const { current, items } = useStudyStore.getState();
  if (current?.document_id === documentId && current.result) return current;
  return items.find((d) => d.document_id === documentId && d.result) ?? null;
}

/** Redirects to the first chapter quiz for this deck. */
export default function QuizIndexRedirect() {
  const params = useParams<{ documentId: string }>();
  const router = useRouter();
  const upsert = useStudyStore((s) => s.upsert);
  const setCurrent = useStudyStore((s) => s.setCurrent);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let deck = deckFromStore(params.documentId);
        if (!deck) {
          deck = await getStudyCards(params.documentId);
          if (cancelled) return;
          upsert(deck);
          setCurrent(deck);
        }
        if (cancelled) return;
        const chapter =
          deck.result?.chapters.find((c) => (c.quiz?.length ?? 0) > 0) ??
          deck.result?.chapters?.[0];
        if (chapter) {
          router.replace(routes.studyQuiz(params.documentId, chapter.chapter_key));
          return;
        }
      } catch {
        // fall through
      }
      if (!cancelled) router.replace(routes.studyDeck(params.documentId));
    })();
    return () => {
      cancelled = true;
    };
  }, [params.documentId, router, upsert, setCurrent]);

  return (
    <div className="flex justify-center py-20">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
