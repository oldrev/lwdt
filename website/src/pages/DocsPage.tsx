import { useMemo, useState } from "react";
import type { Dict, Lang } from "../i18n";
import { GH } from "../i18n";
import { DOCS } from "../content/docs";
import { MarkdownDoc } from "../components/MarkdownDoc";
import { BootTimeline } from "../components/BootTimeline";
import { extractHeadings } from "../docs-utils";

export function DocsPage({
  t,
  lang,
  currentDocId,
  onNavigate,
}: {
  t: Dict;
  lang: Lang;
  currentDocId: string;
  onNavigate: (view: "home" | "docs", docId?: string) => void;
}) {
  const [search, setSearch] = useState("");
  const groups = t.docs.sidebarGroups;
  const allItems = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const activeDocId = DOCS[lang][currentDocId] ? currentDocId : "overview";
  const activeIndex = allItems.findIndex((item) => item.id === activeDocId);
  const activeItem = allItems[activeIndex] ?? allItems[0];
  const source = DOCS[lang][activeDocId];
  const prevItem = activeIndex > 0 ? allItems[activeIndex - 1] : null;
  const nextItem = activeIndex < allItems.length - 1 ? allItems[activeIndex + 1] : null;
  const toc = useMemo(() => extractHeadings(source), [source]);

  const normalizedQuery = search.trim().toLowerCase();
  const filteredGroups = useMemo(() => {
    if (!normalizedQuery) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          const content = DOCS[lang][item.id]?.toLowerCase() ?? "";
          return item.label.toLowerCase().includes(normalizedQuery) || item.id.includes(normalizedQuery) || content.includes(normalizedQuery);
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, lang, normalizedQuery]);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_210px]">
        <aside className="border-b-2 border-line pb-6 lg:sticky lg:top-[80px] lg:h-[calc(100vh-100px)] lg:overflow-y-auto lg:border-b-0 lg:border-r-2 lg:pr-6">
          <div className="relative mb-6">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.ui.search}
              className="w-full border-2 border-line bg-paper-2 px-3.5 py-2.5 font-mono text-[13px] text-ink placeholder:text-warm focus:border-orange focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="micro absolute right-2.5 top-1/2 -translate-y-1/2 text-warm hover:text-ink"
                aria-label={t.ui.close}
              >
                ×
              </button>
            )}
          </div>

          {filteredGroups.length === 0 ? (
            <p className="micro py-6 text-center text-warm">{t.ui.noResults}</p>
          ) : (
            <nav className="flex flex-col gap-6" aria-label={t.ui.docs}>
              {filteredGroups.map((group) => (
                <div key={group.title}>
                  <div className="micro mb-2 border-b border-line-soft pb-1.5 text-warm">{group.title}</div>
                  <ul className="flex flex-col gap-1">
                    {group.items.map((item) => {
                      const selected = item.id === activeDocId;
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => onNavigate("docs", item.id)}
                            className={`flex w-full items-center justify-between px-3 py-2 text-left font-mono text-[13px] transition-colors ${
                              selected
                                ? "bg-panel font-medium text-panel-fg shadow-[inset_3px_0_0_0_var(--p-orange)]"
                                : "text-ink hover:bg-paper-2 hover:text-orange-ink"
                            }`}
                          >
                            <span>{item.label}</span>
                            {selected && <span className="text-[11px] text-hazard">●</span>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          )}

          <div className="mt-8 border-t border-line-soft pt-4">
            <a
              href={GH}
              target="_blank"
              rel="noreferrer"
              className="micro flex items-center justify-between text-warm transition-colors hover:text-orange-ink"
            >
              <span>GITHUB REPOSITORY</span>
              <span>↗</span>
            </a>
          </div>
        </aside>

        <main className="min-w-0 pb-16 lg:pl-4">
          <div className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[12px] text-warm">
            <button onClick={() => onNavigate("home")} className="hover:text-ink hover:underline">
              {t.ui.home}
            </button>
            <span>/</span>
            <span>{t.ui.breadcrumbDocs}</span>
            <span>/</span>
            <span className="font-semibold text-ink">{activeItem.label}</span>
          </div>

          <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-y border-line-soft bg-paper-2 px-4 py-2.5">
            <span className="micro text-warm">
              MARKDOWN SOURCE · src/content/{lang}/{activeDocId}.md
            </span>
            <span className="micro text-signal">{lang === "zh" ? "可直接编辑维护" : "EDITABLE SOURCE"}</span>
          </div>

          <MarkdownDoc source={source} />

          {/* The visual timeline supplements its Markdown explanation. */}
          {activeDocId === "boot" && (
            <div className="mt-10 border-t-2 border-line pt-8">
              <BootTimeline t={t} />
            </div>
          )}

          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t-2 border-line pt-6">
            {prevItem ? (
              <button
                onClick={() => onNavigate("docs", prevItem.id)}
                className="group flex flex-col items-start border-2 border-line bg-paper-2 px-5 py-3 text-left transition-colors hover:border-orange"
              >
                <span className="micro text-warm group-hover:text-orange-ink">← {t.ui.prev}</span>
                <span className="mt-1 font-mono text-[14px] font-bold text-ink">{prevItem.label}</span>
              </button>
            ) : (
              <span />
            )}

            {nextItem ? (
              <button
                onClick={() => onNavigate("docs", nextItem.id)}
                className="group flex flex-col items-end border-2 border-line bg-paper-2 px-5 py-3 text-right transition-colors hover:border-orange"
              >
                <span className="micro text-warm group-hover:text-orange-ink">{t.ui.next} →</span>
                <span className="mt-1 font-mono text-[14px] font-bold text-ink">{nextItem.label}</span>
              </button>
            ) : (
              <span />
            )}
          </div>
        </main>

        {/* Right rail: table of contents generated from Markdown headings */}
        <aside className="hidden xl:block">
          <div className="sticky top-[84px] max-h-[calc(100vh-110px)] overflow-y-auto border-l-2 border-line pl-4">
            <div className="micro mb-3 border-b border-line-soft pb-2 text-warm">{t.ui.onThisPage}</div>
            {toc.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`block font-mono text-[12.5px] leading-snug text-warm transition-colors hover:text-orange-ink ${
                        item.level === 3 ? "pl-3" : ""
                      }`}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-mono text-[12px] leading-relaxed text-warm-2">
                {lang === "zh" ? "本页无小节标题" : "No sections on this page"}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}