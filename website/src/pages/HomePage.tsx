import type { Dict, Lang } from "../i18n";
import { GH } from "../i18n";
import { CodeBlock } from "../components/CodeBlock";
import { BoardStudio } from "../components/BoardStudio";
import { Reveal, Section, SectionHead } from "../components/Bits";

export function HomePage({
  t,
  lang,
  onNavigate,
}: {
  t: Dict;
  lang: Lang;
  onNavigate: (view: "home" | "docs", docId?: string) => void;
}) {
  const h = t.home;

  return (
    <div>
      {/* ====================================================== HERO */}
      <section className="relative isolate flex min-h-[calc(100svh-60px)] items-center overflow-hidden bg-[#171713] text-white">
        <img
          src="https://images.pexels.com/photos/3912367/pexels-photo-3912367.jpeg?auto=compress&cs=tinysrgb&w=2000"
          alt={h.imageAlt}
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
          fetchPriority="high"
        />
        <div className="absolute inset-0 -z-10 bg-[#11100d]/80" />

        <div className="mx-auto w-full max-w-[1340px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-[780px]">
            <p className="micro flex items-center gap-3 text-[#f2c230]">
              <span className="led h-2.5 w-2.5 bg-[#f2c230]" />
              {h.kicker}
            </p>

            <h1 className="mt-7 font-display text-[clamp(4.5rem,16vw,9.5rem)] font-black leading-[0.82] tracking-[-0.06em]">
              LWDT<span className="text-[#ff6a3d]">.</span>
            </h1>

            <h2 className="mt-8 font-display text-[clamp(1.75rem,4.2vw,3rem)] font-bold leading-[1.15] tracking-[-0.035em]">
              {h.t1}
              <br />
              <span className="text-[#ff6a3d]">{h.t2}</span>
            </h2>

            <p className="mt-6 max-w-[58ch] text-[15.5px] leading-[1.9] text-white/85 sm:text-[17px]">
              {h.lead}
            </p>

            <div className="mt-9 flex flex-wrap gap-3.5">
              <button
                onClick={() => onNavigate("docs", "overview")}
                className="border-2 border-[#ff6a3d] bg-[#ff6a3d] px-6 py-3.5 font-mono text-[13px] font-medium tracking-[0.04em] text-[#180d08] transition-colors hover:border-white hover:bg-white"
              >
                {h.ctaDocs} →
              </button>
              <button
                onClick={() => onNavigate("docs", "quickstart")}
                className="border-2 border-white/80 px-6 py-3.5 font-mono text-[13px] tracking-[0.04em] text-white transition-colors hover:bg-white hover:text-[#180d08]"
              >
                {h.ctaQuickstart}
              </button>
              <a
                href={GH}
                target="_blank"
                rel="noreferrer"
                className="border-2 border-white/30 px-5 py-3.5 font-mono text-[13px] tracking-[0.04em] text-white/80 transition-colors hover:border-white hover:text-white"
              >
                {h.ctaGithub} ↗
              </a>
            </div>

            {/* Stats row */}
            <div className="mt-12 grid grid-cols-2 gap-6 border-t border-white/20 pt-7 sm:grid-cols-4">
              {h.stats.map((s) => (
                <div key={s.k}>
                  <div className="tnum font-display text-[clamp(2rem,4.5vw,2.75rem)] font-black leading-none text-[#ff6a3d]">
                    {s.v}
                  </div>
                  <div className="micro mt-2 leading-[1.4] text-white/70">{s.k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <a
          href="https://www.pexels.com/photo/performance-tracker-on-table-3912367/"
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-3 right-4 font-mono text-[11px] text-white/70 underline-offset-2 hover:text-white hover:underline sm:bottom-5 sm:right-8"
        >
          {h.photoCredit}
        </a>
      </section>

      {/* ====================================================== PILLARS */}
      <Section>
        <SectionHead
          num="01"
          en="CORE ARCHITECTURE"
          title={h.pillarsTitle}
          lead={h.pillarsLead}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {h.pillars.map((p, idx) => (
            <Reveal key={p.title}>
              <div className="flex h-full flex-col justify-between border-2 border-line bg-paper-2 p-6 transition-all hover:border-orange hover:shadow-[0_4px_0_0_var(--p-orange)]">
                <div>
                  <div className="flex items-center justify-between border-b border-line-soft pb-2.5">
                    <span className="micro text-orange-ink">{p.tag}</span>
                    <span className="micro text-warm">0{idx + 1}</span>
                  </div>
                  <h3 className="mt-4 font-display text-[18px] font-bold leading-snug tracking-tight text-ink">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-[1.8] text-ink-2">{p.desc}</p>
                </div>
                <button
                  onClick={() => onNavigate("docs", p.linkId)}
                  className="micro mt-6 inline-flex items-center gap-1.5 text-orange-ink transition-colors hover:text-ink"
                >
                  {lang === "zh" ? "阅读相关章节 →" : "Read Chapter →"}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ====================================================== COMPARISON */}
      <Section alt>
        <SectionHead
          num="02"
          en="VALUE PROPOSITION"
          title={h.compareTitle}
          lead={h.compareLead}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="micro mb-3 inline-block border border-warm-2 px-2.5 py-1 text-warm">
              {h.beforeLabel}
            </div>
            <CodeBlock t={t} code={h.beforeCode} file="main/led.c (Before)" tone="dark" />
          </div>
          <div>
            <div className="micro mb-3 inline-block border border-orange bg-orange px-2.5 py-1 text-on-orange">
              {h.afterLabel}
            </div>
            <CodeBlock t={t} code={h.afterCode} file="main/led.c (With LWDT)" tone="paper" />
          </div>
        </div>
      </Section>

      {/* ====================================================== INTERACTIVE STUDIO */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-line pb-4">
          <div>
            <div className="micro text-orange-ink">§ 03 · INTERACTIVE PLAYGROUND</div>
            <h2 className="mt-2 font-display text-[clamp(1.75rem,4vw,2.6rem)] font-extrabold tracking-[-0.025em] text-ink">
              {h.studioTitle}
            </h2>
            <p className="mt-2 text-[15px] text-ink-2">{h.studioLead}</p>
          </div>
          <button
            onClick={() => onNavigate("docs", "boards")}
            className="micro border border-line px-4 py-2 text-ink transition-colors hover:border-orange hover:bg-orange hover:text-on-orange"
          >
            {h.studioLinkText}
          </button>
        </div>

        <div className="mt-8">
          <BoardStudio t={t} />
        </div>
      </Section>

      {/* ====================================================== QUICK START TEASER */}
      <Section alt>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="micro text-orange-ink">§ 04 · QUICK START</span>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.6rem)] font-extrabold tracking-[-0.025em] text-ink">
              {h.quickstartTitle}
            </h2>
            <p className="mt-4 text-[15.5px] leading-[1.85] text-ink-2">
              {lang === "zh"
                ? "LWDT 随仓库附带 Blink 完整测试工程，内置 4 块常用开发板定义。使用 standard ESP-IDF 命令行即可完成板型切换与编译。"
                : "LWDT ships with a complete Blink example project supporting 4 built-in development boards. Switch targets effortlessly using standard idf.py commands."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate("docs", "quickstart")}
                className="border-2 border-line bg-panel px-6 py-3 font-mono text-[13px] font-medium tracking-[0.04em] text-panel-fg transition-colors hover:border-orange hover:bg-orange hover:text-on-orange"
              >
                {h.quickstartLinkText}
              </button>
            </div>
          </div>

          <div>
            <CodeBlock t={t} code={h.quickstartCmd} file="Terminal" tone="dark" />
          </div>
        </div>
      </Section>

      {/* ====================================================== DOCS INDEX PREVIEW */}
      <Section>
        <SectionHead
          num="05"
          en="DOCUMENTATION DIRECTORY"
          title={h.docsIndexTitle}
          lead={
            lang === "zh"
              ? "查阅完整的架构指南、设备树规范、驱动运行时生命周期及 API 宏参考手册。"
              : "Explore comprehensive guides on architecture, device tree format, driver lifecycle, and API macro reference."
          }
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {h.docsCards.map((c) => (
            <button
              key={c.id}
              onClick={() => onNavigate("docs", c.id)}
              className="group flex flex-col justify-between border-2 border-line bg-paper p-6 text-left transition-all hover:border-orange hover:bg-paper-2"
            >
              <div>
                <div className="micro text-orange-ink group-hover:text-ink">
                  {lang === "zh" ? "章节" : "CHAPTER"} → {c.id.toUpperCase()}
                </div>
                <h3 className="mt-3 font-display text-[19px] font-bold text-ink">
                  {c.title}
                </h3>
                <p className="mt-2 text-[14px] leading-[1.75] text-ink-2">{c.desc}</p>
              </div>
              <div className="micro mt-5 flex items-center gap-1.5 font-medium text-orange-ink group-hover:underline">
                {lang === "zh" ? "打开文档" : "Open Section"} ↗
              </div>
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}
