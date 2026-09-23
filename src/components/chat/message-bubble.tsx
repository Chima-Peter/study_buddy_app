"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy, GitBranch, Pencil, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { UiMessage } from "@/stores/chat-store";
import { Markdown } from "@/components/ui/markdown";
import { Modal } from "@/components/ui/modal";
import { ThinkingIndicator } from "./thinking-indicator";
import { useSmoothReveal } from "./use-smooth-reveal";

const USER_PREVIEW_WORDS = 100;
const MAX_RETRIES = 3;
const DESKTOP_MQ = "(min-width: 640px)";

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

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isDesktop;
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
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-1.5",
        "text-[var(--text-secondary)] transition hover:bg-black/[0.04] hover:text-[var(--text-primary)]",
        "disabled:pointer-events-none disabled:opacity-40",
      )}
    >
      {icon}
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
      label={copied ? "Copied to clipboard" : "Copy message"}
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
          className="mt-1.5 text-xs font-medium text-white/80 underline-offset-2 hover:text-white hover:underline"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}

function UserEditDesktop({
  open,
  initialText,
  onClose,
  onSave,
  disabled,
}: {
  open: boolean;
  initialText: string;
  onClose: () => void;
  onSave: (text: string) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(initialText);

  useEffect(() => {
    if (open) setDraft(initialText);
  }, [open, initialText]);

  const trimmed = draft.trim();
  const canSave =
    !disabled && trimmed.length > 0 && trimmed !== initialText.trim();

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title="Edit message"
      description="Save to regenerate the reply from this point."
    >
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={8}
        disabled={disabled}
        className="w-full resize-y rounded-lg border border-border bg-white px-3 py-2.5 text-sm leading-relaxed text-[var(--text-primary)] outline-none focus:border-primary-600 disabled:opacity-60"
        aria-label="Edit message"
      />
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-black/5"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={() => {
            if (!canSave) return;
            onSave(trimmed);
            onClose();
          }}
          className="rounded-lg bg-primary-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </Modal>
  );
}

function UserEditMobile({
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
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [draft]);

  const trimmed = draft.trim();
  const canSave =
    !disabled && trimmed.length > 0 && trimmed !== initialText.trim();

  return (
    <div ref={wrapRef} className="w-full max-w-[min(100%,28rem)] space-y-2">
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={3}
        disabled={disabled}
        className="w-full resize-none rounded-[1.25rem] border border-border bg-white px-4 py-3 text-[15px] leading-relaxed text-[var(--text-primary)] shadow-md outline-none focus:border-primary-600 disabled:opacity-60"
        aria-label="Edit message"
      />
      <div className="flex items-center justify-end gap-2 px-1">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium text-muted"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={() => {
            if (!canSave) return;
            onSave(trimmed);
          }}
          className="rounded-full bg-primary-700 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
        >
          Save
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
  const isDesktop = useIsDesktop();
  const [editing, setEditing] = useState(false);

  const closeEdit = () => setEditing(false);
  const canEdit = Boolean(onEdit) && !actionsDisabled && Boolean(message.continuationKey);

  const handleSave = (text: string) => {
    onEdit?.(message.id, text);
    closeEdit();
  };

  if (editing && !isDesktop) {
    return (
      <div className="flex justify-end">
        <UserEditMobile
          initialText={message.content}
          onCancel={closeEdit}
          onSave={handleSave}
          disabled={actionsDisabled}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="max-w-[min(100%,28rem)] rounded-[1.25rem] bg-primary-700 px-4 py-3 text-[15px] leading-relaxed text-white shadow-md">
        <UserMessageBody content={message.content} />
      </div>
      <div className="flex items-center gap-0.5 pr-1">
        <CopyButton text={message.content} />
        <ActionButton
          label="Edit message"
          icon={<Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />}
          onClick={() => setEditing(true)}
          disabled={!canEdit}
        />
      </div>
      {isDesktop && (
        <UserEditDesktop
          open={editing}
          initialText={message.content}
          onClose={closeEdit}
          onSave={handleSave}
          disabled={actionsDisabled}
        />
      )}
    </div>
  );
}

function AssistantMessage({
  message,
  onRetry,
  onBranch,
  actionsDisabled,
}: {
  message: UiMessage;
  onRetry?: (messageId: string) => void;
  onBranch?: (messageId: string) => void;
  actionsDisabled?: boolean;
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
    Boolean(onBranch) && !streaming && hasContent && !actionsDisabled;

  return (
    <div className="space-y-1.5">
      <div className="chat-soft-card space-y-2 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            Tutor
          </span>
          {showWriting && (
            <ThinkingIndicator label="Writing" compact className="gap-1.5" />
          )}
        </div>
        <div
          className={cn(
            "text-[15px] leading-relaxed text-[var(--text-primary)]",
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
      {!streaming && hasContent && (
        <div className="flex items-center gap-0.5 pl-1">
          <CopyButton text={message.content} />
          <ActionButton
            label={
              retries >= MAX_RETRIES
                ? "No retries left"
                : retries > 0
                  ? `Try again (${retries}/${MAX_RETRIES})`
                  : "Try again"
            }
            icon={<RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />}
            onClick={() => onRetry?.(message.id)}
            disabled={!canRetry}
          />
          <ActionButton
            label="Branch in new chat"
            icon={<GitBranch className="h-3.5 w-3.5" strokeWidth={1.75} />}
            onClick={() => onBranch?.(message.id)}
            disabled={!canBranch}
          />
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
}: {
  message: UiMessage;
  onRetry?: (messageId: string) => void;
  onEdit?: (messageId: string, newQuery: string) => void;
  onBranch?: (messageId: string) => void;
  actionsDisabled?: boolean;
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
    />
  );
}
