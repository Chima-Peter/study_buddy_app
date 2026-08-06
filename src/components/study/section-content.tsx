import type { StudyChapter } from "@/types";
import { Markdown } from "@/components/ui/markdown";
import { formatChapterTitle } from "@/lib/utils/format";

export function SectionContent({ chapter }: { chapter: StudyChapter }) {
  return (
    <article className="max-w-none space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          {formatChapterTitle(chapter.chapter_key)}
        </h1>
        {chapter.introduction && (
          <Markdown className="mt-3 text-[var(--text-secondary)]">
            {chapter.introduction}
          </Markdown>
        )}
      </header>
      {chapter.sections.map((section) => (
        <section key={section.title} className="space-y-3">
          <h2 className="text-xl font-semibold">{section.title}</h2>
          <Markdown className="text-[15px] text-[var(--text-primary)]">
            {section.content}
          </Markdown>
          {(section.references?.length > 0 || section.external_references?.length > 0) && (
            <div className="rounded-md border border-border bg-surface-secondary p-4">
              <h3 className="mb-2 text-sm font-semibold">References</h3>
              <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
                {section.references?.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
                {section.external_references?.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ))}
    </article>
  );
}
