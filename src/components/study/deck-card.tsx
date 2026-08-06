"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { StudyCards } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { generateStudyCards } from "@/lib/api/study-cards";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";

export function DeckCard({ deck }: { deck: StudyCards }) {
  const { toast } = useToast();
  const chapters = deck.result?.chapters?.length ?? 0;
  const questions =
    deck.result?.chapters?.reduce((sum, c) => sum + (c.quiz?.length ?? 0), 0) ?? 0;
  const quizChapter =
    deck.result?.chapters?.find((c) => (c.quiz?.length ?? 0) > 0)?.chapter_key ??
    deck.result?.chapters?.[0]?.chapter_key;

  const retry = async () => {
    try {
      await generateStudyCards(deck.document_id);
      toast({ title: "Regeneration queued", variant: "success" });
    } catch (err) {
      toast({
        title: "Could not regenerate",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    }
  };

  return (
    <Card
      status={
        deck.status === "success"
          ? "success"
          : deck.status === "failed"
            ? "error"
            : "info"
      }
    >
      <CardHeader>
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary-500/15 text-primary-700">
          <BookOpen className="h-5 w-5" />
        </div>
        <CardTitle className="text-base">Document {deck.document_id.slice(0, 8)}…</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Badge
          variant={
            deck.status === "success"
              ? "success"
              : deck.status === "failed"
                ? "error"
                : "warning"
          }
        >
          {deck.status}
        </Badge>
        {deck.status === "success" && (
          <p className="text-sm text-[var(--text-secondary)]">
            {chapters} chapters · {questions} questions
          </p>
        )}
        {deck.status === "pending" && (
          <p className="text-sm text-[var(--text-secondary)]">Generating study cards…</p>
        )}
      </CardContent>
      <CardFooter>
        {deck.status === "success" && (
          <>
            <Link href={routes.studyDeck(deck.document_id)}>
              <Button size="sm">Read</Button>
            </Link>
            {quizChapter && (
              <Link href={routes.studyQuiz(deck.document_id, quizChapter)}>
                <Button size="sm" variant="secondary">
                  Take Quiz
                </Button>
              </Link>
            )}
          </>
        )}
        {deck.status === "failed" && (
          <Button size="sm" variant="secondary" onClick={retry}>
            Retry
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
