"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import type { StudyChapter, StudySection } from "@/types";
import { Markdown } from "@/components/ui/markdown";
import { formatChapterTitle } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-study-display",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-study-sans",
});

type StudyCard =
  | { kind: "intro"; title: string; content: string }
  | { kind: "section"; title: string; section: StudySection }
  | { kind: "mnemonic"; title: string; content: string };

function buildCards(chapter: StudyChapter): StudyCard[] {
  const cards: StudyCard[] = [];
  if (chapter.introduction?.trim()) {
    cards.push({
      kind: "intro",
      title: "Overview",
      content: chapter.introduction,
    });
  }
  for (const section of chapter.sections) {
    cards.push({ kind: "section", title: section.title, section });
  }
  for (const [title, content] of Object.entries(chapter.mnemonics ?? {})) {
    const trimmed = content?.trim();
    if (!title.trim() || !trimmed) continue;
    cards.push({ kind: "mnemonic", title: title.trim(), content: trimmed });
  }
  return cards;
}

function cardKindLabel(kind: StudyCard["kind"]) {
  if (kind === "intro") return "Chapter overview";
  if (kind === "mnemonic") return "Memory aid";
  return "Study section";
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function ReferenceText({ value }: { value: string }) {
  const trimmed = value.trim();
  if (!isHttpUrl(trimmed)) return <>{value}</>;

  return (
    <a
      href={trimmed}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all text-[#0f766e] underline decoration-[#0f766e]/35 underline-offset-2 hover:decoration-[#0f766e]"
    >
      {value}
    </a>
  );
}

const SWIPE = 60;

export function MiniStudyCards({ chapter }: { chapter: StudyChapter }) {
  const cards = useMemo(() => buildCards(chapter), [chapter]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    setIndex(0);
    setDirection(0);
  }, [chapter.chapter_key]);

  const safeIndex = Math.min(index, Math.max(cards.length - 1, 0));
  const card = cards[safeIndex];

  const go = useCallback(
    (next: number) => {
      if (next < 0 || next >= cards.length) return;
      setDirection(next > safeIndex ? 1 : -1);
      setIndex(next);
    },
    [cards.length, safeIndex],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        go(safeIndex + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        go(safeIndex - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, safeIndex]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE || info.velocity.x < -400) go(safeIndex + 1);
    else if (info.offset.x > SWIPE || info.velocity.x > 400) go(safeIndex - 1);
  };

  if (!card) {
    return (
      <p className="border border-dashed border-border px-6 py-12 text-center text-sm text-[var(--text-secondary)]">
        No notes in this chapter yet.
      </p>
    );
  }

  const refs =
    card.kind === "section"
      ? [
          ...(card.section.references ?? []),
          ...(card.section.external_references ?? []),
        ]
      : [];
  const isMnemonic = card.kind === "mnemonic";
  const body =
    card.kind === "section" ? card.section.content : card.content;

  return (
    <div
      className={cn(
        "study-deck mx-auto w-full max-w-3xl space-y-4 lg:max-w-4xl lg:space-y-5",
        display.variable,
        sans.variable,
      )}
    >
      <div className="relative overflow-x-clip">
        <div
          className="pointer-events-none absolute -inset-x-2 -top-4 bottom-8 rounded-[2rem] opacity-90 lg:-inset-x-6 lg:-top-6"
          style={{
            background: isMnemonic
              ? "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(240,196,25,0.28), transparent 55%), radial-gradient(ellipse 70% 50% at 95% 30%, rgba(45,212,191,0.12), transparent 50%)"
              : "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(45,212,191,0.22), transparent 55%), radial-gradient(ellipse 70% 50% at 95% 30%, rgba(240,196,25,0.14), transparent 50%)",
          }}
          aria-hidden
        />

        <div className="relative px-1 pb-3 pt-1 lg:px-2 lg:pb-4" style={{ perspective: 900 }}>
          {safeIndex < cards.length - 1 && (
            <div
              aria-hidden
              className={cn(
                "absolute inset-x-4 top-4 bottom-0 rounded-[1.25rem] lg:inset-x-6 lg:rounded-[1.5rem]",
                isMnemonic ? "bg-[#b45309]/10" : "bg-[#0f766e]/12",
              )}
              style={{ transform: "translateY(14px) rotate(-1.5deg) scale(0.98)" }}
            />
          )}
          {safeIndex < cards.length - 2 && (
            <div
              aria-hidden
              className={cn(
                "absolute inset-x-7 top-5 bottom-0 rounded-[1.25rem] lg:inset-x-10 lg:rounded-[1.5rem]",
                isMnemonic ? "bg-[#b45309]/06" : "bg-[#0f766e]/08",
              )}
              style={{ transform: "translateY(26px) rotate(1.2deg) scale(0.96)" }}
            />
          )}

          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.article
              key={`${chapter.chapter_key}-${safeIndex}`}
              custom={direction}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={onDragEnd}
              initial={{
                opacity: 0,
                x: direction >= 0 ? 48 : -48,
                rotate: direction >= 0 ? 3 : -3,
              }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{
                opacity: 0,
                x: direction >= 0 ? -40 : 40,
                rotate: direction >= 0 ? -2 : 2,
              }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "study-flashcard relative z-10 cursor-grab active:cursor-grabbing lg:rounded-[1.5rem]",
                isMnemonic && "study-flashcard--mnemonic",
              )}
            >
              <div
                className="pointer-events-none absolute right-0 top-0 h-16 w-16 lg:h-24 lg:w-24"
                style={{
                  background: isMnemonic
                    ? "linear-gradient(225deg, rgba(240,196,25,0.75) 0%, rgba(240,196,25,0.12) 45%, transparent 55%)"
                    : "linear-gradient(225deg, rgba(240,196,25,0.55) 0%, rgba(240,196,25,0.08) 45%, transparent 55%)",
                }}
                aria-hidden
              />

              <div className="flex items-center justify-between gap-3 border-b border-[#0c2420]/08 px-5 pb-3 pt-4 lg:px-8 lg:pb-4 lg:pt-6">
                <div className="min-w-0">
                  <p
                    className={cn(
                      "truncate text-[11px] font-semibold uppercase tracking-[0.16em] lg:text-xs",
                      isMnemonic ? "text-[#b45309]" : "text-[#0f766e]",
                    )}
                  >
                    {formatChapterTitle(chapter.chapter_key)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#5a7a73] lg:text-sm">
                    {cardKindLabel(card.kind)}
                    <span className="lg:hidden"> · swipe</span>
                    <span className="hidden lg:inline"> · ← → keys</span>
                  </p>
                </div>
                <div className="flex shrink-0 items-baseline gap-0.5 font-[family-name:var(--font-study-display)]">
                  <span className="text-2xl font-semibold leading-none text-[#0c2420] lg:text-3xl">
                    {safeIndex + 1}
                  </span>
                  <span className="text-sm text-[#5a7a73] lg:text-base">/{cards.length}</span>
                </div>
              </div>

              <div className="relative px-5 pb-2 pt-5 lg:px-8 lg:pt-7">
                <div
                  className={cn(
                    "absolute left-0 top-5 bottom-2 w-1 rounded-r-full lg:top-7 lg:w-1.5",
                    isMnemonic ? "bg-[#f0c419]" : "bg-[#14b8a6]",
                  )}
                  aria-hidden
                />
                <h2 className="pl-3 font-[family-name:var(--font-study-display)] text-[1.55rem] font-semibold leading-[1.2] tracking-tight text-[#0c2420] lg:pl-4 lg:text-[2rem]">
                  {card.title}
                </h2>
              </div>

              <div
                className={cn(
                  "mx-3 mb-3 mt-2 max-h-[min(48dvh,24rem)] overflow-y-auto overscroll-contain rounded-xl px-4 lg:mx-5 lg:mb-5 lg:mt-3 lg:max-h-[min(56dvh,32rem)] lg:rounded-2xl lg:px-7",
                  isMnemonic ? "study-flashcard-mnemonic" : "study-flashcard-body",
                )}
              >
                {isMnemonic ? (
                  <p className="font-[family-name:var(--font-study-display)] text-[1.2rem] font-medium leading-snug tracking-tight text-[#0c2420] lg:text-[1.45rem] lg:leading-snug">
                    {body}
                  </p>
                ) : (
                  <Markdown className="study-flashcard-md font-[family-name:var(--font-study-sans)] text-[15px] text-[#0c2420] lg:text-base">
                    {body}
                  </Markdown>
                )}

                {refs.length > 0 && (
                  <div className="study-flashcard-refs">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0f766e] lg:text-[11px]">
                      References
                    </p>
                    <ul className="text-[13px] text-[#3d5c56] lg:text-sm">
                      {refs.map((r) => (
                        <li key={r} className="flex gap-2">
                          <span className="mt-[calc((var(--study-line)-4px)/2)] h-1 w-1 shrink-0 rounded-full bg-[#14b8a6]" />
                          <span>
                            <ReferenceText value={r} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 px-5 pb-4 lg:px-8 lg:pb-6">
                {cards.map((c, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors duration-200 lg:h-1.5",
                      i > safeIndex
                        ? "bg-[#0c2420]/08"
                        : c.kind === "mnemonic"
                          ? "bg-[#b45309]"
                          : "bg-[#0f766e]",
                    )}
                  />
                ))}
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-3 px-1 lg:gap-4">
        <button
          type="button"
          disabled={safeIndex <= 0}
          onClick={() => go(safeIndex - 1)}
          aria-label="Previous card"
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#0c2420]/12 bg-white text-[#0c2420] transition-all lg:h-14 lg:w-14",
            "hover:border-[#0f766e] hover:text-[#0f766e] active:scale-95",
            "disabled:pointer-events-none disabled:opacity-30",
          )}
        >
          <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6" />
        </button>

        <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <div className="flex max-w-full items-center justify-center gap-1.5 overflow-x-hidden py-1">
            {cards.map((c, i) => (
              <button
                key={i}
                type="button"
                aria-label={
                  c.kind === "mnemonic" ? `Mnemonic ${i + 1}` : `Card ${i + 1}`
                }
                aria-current={i === safeIndex ? "true" : undefined}
                onClick={() => go(i)}
                className={cn(
                  "h-2.5 shrink-0 rounded-full transition-all duration-200",
                  i === safeIndex
                    ? cn(
                        "w-6 lg:w-8",
                        c.kind === "mnemonic" ? "bg-[#b45309]" : "bg-[#0f766e]",
                      )
                    : c.kind === "mnemonic"
                      ? "w-2.5 bg-[#b45309]/30 hover:bg-[#b45309]"
                      : "w-2.5 bg-[#0c2420]/15 hover:bg-[#14b8a6]",
                )}
              />
            ))}
          </div>
          <p className="text-[11px] text-[#5a7a73] lg:text-sm">
            {safeIndex + 1} of {cards.length}
          </p>
        </div>

        <button
          type="button"
          disabled={safeIndex >= cards.length - 1}
          onClick={() => go(safeIndex + 1)}
          aria-label="Next card"
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0f766e] text-white transition-all lg:h-14 lg:w-14",
            "hover:bg-[#115e59] active:scale-95",
            "disabled:pointer-events-none disabled:opacity-30",
          )}
        >
          <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6" />
        </button>
      </div>
    </div>
  );
}
