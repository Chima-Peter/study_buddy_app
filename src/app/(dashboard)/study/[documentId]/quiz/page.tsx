"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getStudyCards } from "@/lib/api/study-cards";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";

/** Redirects to the first chapter quiz for this deck. */
export default function QuizIndexRedirect() {
  const params = useParams<{ documentId: string }>();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const deck = await getStudyCards(params.documentId);
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
  }, [params.documentId, router]);

  return (
    <div className="flex justify-center py-20">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
