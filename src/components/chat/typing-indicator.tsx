export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 rounded-2xl bg-surface-tertiary px-4 py-3 w-fit">
      <span className="typing-dot h-2 w-2 rounded-full bg-muted" />
      <span className="typing-dot h-2 w-2 rounded-full bg-muted" />
      <span className="typing-dot h-2 w-2 rounded-full bg-muted" />
    </div>
  );
}
