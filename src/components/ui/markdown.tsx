"use client";

import type { Components } from "react-markdown";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils/cn";

/** Restore row breaks for GFM tables jammed onto a single line. */
function fixCollapsedTables(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      // Only rewrite single-line blocks that look like a full GFM table
      if (
        !trimmed.includes("\n") &&
        trimmed.includes("|") &&
        /\|?\s*-{3,}/.test(trimmed)
      ) {
        return trimmed.replace(/\|\s*\|/g, "|\n|");
      }
      return block;
    })
    .join("\n\n");
}

/** Repair common markdown issues from API/LLM content. */
function normalizeMarkdown(source: string): string {
  const text = source
    .replace(/\r\n/g, "\n")
    // Literal "\n" / "\t" sequences from JSON-escaped payloads
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t");

  return fixCollapsedTables(text);
}

function urlTransform(url: string): string {
  // Allow data: images from API (diagrams, charts) in addition to default schemes
  if (/^data:image\/[a-z0-9.+-]+;base64,/i.test(url)) return url;
  return defaultUrlTransform(url);
}

const components: Components = {
  a({ href, children, ...props }) {
    const external = href?.startsWith("http");
    return (
      <a
        href={href}
        {...props}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : undefined)}
      >
        {children}
      </a>
    );
  },
  img({ src, alt, title, ...props }) {
    if (!src) return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote/API URLs; next/image needs known hosts
      <img
        src={src}
        alt={alt ?? ""}
        title={title}
        loading="lazy"
        decoding="async"
        {...props}
      />
    );
  },
  table({ children, ...props }) {
    return (
      <div className="markdown-table-wrap">
        <table {...props}>{children}</table>
      </div>
    );
  },
};

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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        urlTransform={urlTransform}
      >
        {normalizeMarkdown(children)}
      </ReactMarkdown>
    </div>
  );
}
