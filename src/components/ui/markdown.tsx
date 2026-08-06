"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils/cn";

/** Repair common markdown issues from API/LLM content. */
function normalizeMarkdown(source: string): string {
  let text = source.replace(/\r\n/g, "\n").replace(/\\n/g, "\n");

  // Collapsed GFM tables often arrive as one line:
  // "| A | B | | --- | --- | | 1 | 2 |" → restore row breaks at "| |"
  text = text.replace(/\|\s*\|/g, "|\n|");

  return text;
}

export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  if (!children) return null;

  return (
    <div className={cn("markdown-body", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {normalizeMarkdown(children)}
      </ReactMarkdown>
    </div>
  );
}
