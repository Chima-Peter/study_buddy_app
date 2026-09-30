"use client";

import type { Components } from "react-markdown";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink, MonitorPlay } from "lucide-react";
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

/** Turn bare http(s) URLs into markdown links when not already linked. */
function linkifyBareUrls(text: string): string {
  return text.replace(
    /(^|[\s])((https?:\/\/[^\s<>"'`\]}]+))/g,
    (_full, prefix: string, url: string) => {
      let href = url;
      let trailing = "";
      const punct = href.match(/[.,;:!?)]+$/);
      if (punct) {
        trailing = punct[0];
        href = href.slice(0, -trailing.length);
      }
      if (!href) return `${prefix}${url}`;
      return `${prefix}[${href}](${href})${trailing}`;
    },
  );
}

/** Repair common markdown issues from API/LLM content. */
function normalizeMarkdown(source: string): string {
  const text = source
    .replace(/\r\n/g, "\n")
    // Literal "\n" / "\t" sequences from JSON-escaped payloads
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t");

  return linkifyBareUrls(fixCollapsedTables(text));
}

function urlTransform(url: string): string {
  // Allow data: images from API (diagrams, charts) in addition to default schemes
  if (/^data:image\/[a-z0-9.+-]+;base64,/i.test(url)) return url;
  return defaultUrlTransform(url);
}

function linkHost(href: string | undefined): string | null {
  if (!href) return null;
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function isYoutubeHost(host: string | null): boolean {
  if (!host) return false;
  return host === "youtu.be" || host.endsWith("youtube.com");
}

const components: Components = {
  a({ href, children, ...props }) {
    const external = Boolean(href?.startsWith("http"));
    if (!external) {
      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    }

    const host = linkHost(href);
    const youtube = isYoutubeHost(host);
    const label =
      typeof children === "string" && children.trim() === href
        ? host ?? children
        : children;

    return (
      <a
        href={href}
        {...props}
        target="_blank"
        rel="noopener noreferrer"
        className="chat-resource-link"
        title={href}
      >
        <span className="chat-resource-link__icon" aria-hidden>
          {youtube ? (
            <MonitorPlay className="h-3.5 w-3.5" strokeWidth={2} />
          ) : (
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
          )}
        </span>
        <span className="chat-resource-link__body">
          <span className="chat-resource-link__label">{label}</span>
          {host && (
            <span className="chat-resource-link__host">
              {youtube ? "YouTube" : host}
            </span>
          )}
        </span>
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
