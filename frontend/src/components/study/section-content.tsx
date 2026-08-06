import type { StudyChapter } from "@/types";

export function SectionContent({ chapter }: { chapter: StudyChapter }) {
  return (
    <article className="prose prose-invert max-w-none space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{chapter.chapter_key}</h1>
        {chapter.introduction && (
          <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">
            {chapter.introduction}
          </p>
        )}
      </header>
      {chapter.sections.map((section) => (
        <section key={section.title} className="space-y-3">
          <h2 className="text-xl font-semibold">{section.title}</h2>
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--text-primary)]">
            {section.content}
          </div>
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
