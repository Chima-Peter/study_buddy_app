"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy, GitBranch, Pencil, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { UiMessage } from "@/stores/chat-store";
import { Markdown } from "@/components/ui/markdown";
import { Spinner } from "@/components/ui/spinner";
import { ThinkingIndicator } from "./thinking-indicator";
import { useSmoothReveal } from "./use-smooth-reveal";

const USER_PREVIEW_WORDS = 100;
const MAX_RETRIES = 3;

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function takeWords(text: string, maxWords: number): string {
  const parts = text.trim().split(/(\s+)/);
  let words = 0;
  let end = 0;
  for (let i = 0; i < parts.length; i++) {
    if (!/\s+/.test(parts[i]) && parts[i].length > 0) {
      words += 1;
      if (words > maxWords) break;
    }
    end = i + 1;
  }
  return parts.slice(0, end).join("").trimEnd();
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

function ActionButton({
  label,
  icon,
  onClick,
  disabled,
  busy,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2",
        "text-[var(--text-secondary)] transition",
        "hover:bg-black/[0.05] hover:text-[var(--text-primary)] dark:hover:bg-white/10",
        "disabled:pointer-events-none disabled:opacity-40",
      )}
    >
      {busy ? <Spinner className="h-3.5 w-3.5" /> : icon}
    </button>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (!text.trim()) return;
    const ok = await copyText(text);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ActionButton
      label={copied ? "Copied" : "Copy"}
      icon={
        copied ? (
          <Check className="h-3.5 w-3.5" strokeWidth={2} />
        ) : (
          <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
        )
      }
      onClick={() => void onCopy()}
      disabled={!text.trim()}
    />
  );
}

function ActionBar({
  children,
  align = "start",
  forceVisible,
}: {
  children: ReactNode;
  align?: "start" | "end";
  forceVisible?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 transition-opacity",
        align === "end" ? "justify-end" : "justify-start",
        forceVisible
          ? "opacity-100"
          : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
      )}
    >
      {children}
    </div>
  );
}

function UserMessageBody({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = countWords(content) > USER_PREVIEW_WORDS;
  const shown =
    isLong && !expanded ? `${takeWords(content, USER_PREVIEW_WORDS)}…` : content;

  return (
    <div>
      <p className="whitespace-pre-wrap break-words">{shown}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-xs font-medium text-primary-800 underline-offset-2 hover:underline"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}

function UserEditInline({
  initialText,
  onCancel,
  onSave,
  disabled,
}: {
  initialText: string;
  onCancel: () => void;
  onSave: (text: string) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(initialText);
  const wrapRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(initialText);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }, [initialText]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) onCancel();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onCancel]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 280)}px`;
  }, [draft]);

  const trimmed = draft.trim();
  const canSave =
    !disabled && trimmed.length > 0 && trimmed !== initialText.trim();

  const save = useCallback(() => {
    if (!canSave) return;
    onSave(trimmed);
  }, [canSave, onSave, trimmed]);

  return (
    <div ref={wrapRef} className="ml-auto w-full max-w-[min(100%,40rem)] space-y-2">
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
            return;
          }
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            save();
          }
        }}
        rows={3}
        disabled={disabled}
        className="w-full resize-none rounded-3xl border border-black/[0.08] bg-[#f4f4f5] px-4 py-3 text-[15px] leading-relaxed text-[var(--text-primary)] outline-none focus:border-primary-600 disabled:opacity-60 dark:border-white/10 dark:bg-white/10"
        aria-label="Edit message"
      />
      <div className="flex items-center justify-end gap-2 px-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-3 py-1.5 text-sm text-[var(--text-secondary)] transition hover:bg-black/[0.04] hover:text-[var(--text-primary)]"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={save}
          className="rounded-full bg-[var(--text-primary)] px-3.5 py-1.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function UserMessage({
  message,
  onEdit,
  actionsDisabled,
}: {
  message: UiMessage;
  onEdit?: (messageId: string, newQuery: string) => void;
  actionsDisabled?: boolean;
}) {
  const [editing, setEditing] = useState(false);

  const closeEdit = useCallback(() => setEditing(false), []);
  const canEdit =
    Boolean(onEdit) && !actionsDisabled && Boolean(message.continuationKey);

  const handleSave = (text: string) => {
    onEdit?.(message.id, text);
    closeEdit();
  };

  if (editing) {
    return (
      <div className="group flex justify-end">
        <UserEditInline
          initialText={message.content}
          onCancel={closeEdit}
          onSave={handleSave}
          disabled={actionsDisabled}
        />
      </div>
    );
  }

  return (
    <div className="group flex flex-col items-end gap-1">
      <div className="max-w-[min(100%,40rem)] rounded-3xl bg-[#f4f4f5] px-4 py-2.5 text-[15px] leading-relaxed text-[var(--text-primary)] dark:bg-white/10">
        <UserMessageBody content={message.content} />
      </div>
      <ActionBar align="end">
        <CopyButton text={message.content} />
        {canEdit && (
          <ActionButton
            label="Edit message"
            icon={<Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />}
            onClick={() => setEditing(true)}
          />
        )}
      </ActionBar>
    </div>
  );
}

function AssistantMessage({
  message,
  onRetry,
  onBranch,
  actionsDisabled,
  branching,
}: {
  message: UiMessage;
  onRetry?: (messageId: string) => void;
  onBranch?: (messageId: string) => void;
  actionsDisabled?: boolean;
  branching?: boolean;
}) {
  const streaming = Boolean(message.streaming);
  const revealed = useSmoothReveal(message.content, streaming);
  const showThinking = streaming && !message.content;
  const showWriting = streaming && !!revealed;
  const retries = message.retryCount ?? 0;
  const hasContent = Boolean(message.content.trim());
  const canRetry =
    Boolean(onRetry) &&
    !streaming &&
    hasContent &&
    retries < MAX_RETRIES &&
    !actionsDisabled &&
    Boolean(message.continuationKey);
  const canBranch =
    Boolean(onBranch) &&
    !streaming &&
    hasContent &&
    !actionsDisabled &&
    Boolean(message.continuationKey);

  return (
    <div className="group space-y-1.5">
      <div className="flex gap-3">
        <div
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-700 text-[11px] font-semibold text-white"
          aria-hidden
        >
          T
        </div>
        <div className="min-w-0 flex-1 space-y-2 pt-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Tutor
            </span>
            {showWriting && (
              <ThinkingIndicator label="Writing" compact className="gap-1.5" />
            )}
          </div>
          <div
            className={cn(
              "text-[15px] leading-7 text-[var(--text-primary)]",
              showThinking && "min-h-[1.25rem]",
            )}
          >
            {streaming && revealed ? (
              <p className="whitespace-pre-wrap break-words">
                {revealed}
                <span className="stream-caret" aria-hidden />
              </p>
            ) : message.content && !streaming ? (
              <Markdown className="chat-markdown">{message.content}</Markdown>
            ) : showThinking ? (
              <ThinkingIndicator label="Thinking" />
            ) : null}
          </div>
        </div>
      </div>
      {!streaming && hasContent && (
        <div className="pl-10">
          <ActionBar forceVisible={branching}>
            <CopyButton text={message.content} />
            {canRetry && (
              <ActionButton
                label={
                  retries > 0
                    ? `Try again (${retries}/${MAX_RETRIES})`
                    : "Try again"
                }
                icon={<RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />}
                onClick={() => onRetry?.(message.id)}
              />
            )}
            {(canBranch || branching) && (
              <ActionButton
                label={branching ? "Opening new chat…" : "Branch in new chat"}
                icon={<GitBranch className="h-3.5 w-3.5" strokeWidth={1.75} />}
                onClick={() => onBranch?.(message.id)}
                busy={branching}
                disabled={actionsDisabled && !branching}
              />
            )}
          </ActionBar>
        </div>
      )}
    </div>
  );
}

export function MessageBubble({
  message,
  onRetry,
  onEdit,
  onBranch,
  actionsDisabled,
  branching,
}: {
  message: UiMessage;
  onRetry?: (messageId: string) => void;
  onEdit?: (messageId: string, newQuery: string) => void;
  onBranch?: (messageId: string) => void;
  actionsDisabled?: boolean;
  branching?: boolean;
}) {
  if (message.role === "user") {
    return (
      <UserMessage
        message={message}
        onEdit={onEdit}
        actionsDisabled={actionsDisabled}
      />
    );
  }

  return (
    <AssistantMessage
      message={message}
      onRetry={onRetry}
      onBranch={onBranch}
      actionsDisabled={actionsDisabled}
      branching={branching}
    />
  );
}
