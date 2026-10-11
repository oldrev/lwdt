import { useState } from "react";
import type { Dict, Lang } from "../i18n";
import { GH } from "../i18n";
import type { ThemeMode } from "../hooks";

export function Mark({
  className = "h-7 w-7",
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  const stroke = invert ? "stroke-panel-fg" : "stroke-ink";
  const fill = invert ? "fill-panel-fg" : "fill-ink";
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="1" y="12" width="8" height="8" className="fill-orange" />
      <path d="M9 16h6v-9h7M15 16v9h7" fill="none" strokeWidth="1.8" className={stroke} />
      <rect x="22" y="3" width="7" height="7" fill="none" strokeWidth="1.8" className={stroke} />
      <rect x="22" y="22" width="7" height="7" className={fill} />
    </svg>
  );
}

const SUN = (
  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="8" cy="8" r="3.1" />
    <path d="M8 .9v2M8 13.1v2M.9 8h2M13.1 8h2M3 3l1.4 1.4M11.6 11.6L13 13M13 3l-1.4 1.4M4.4 11.6L3 13" />
  </svg>
);
const MOON = (
  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M13.2 9.8A5.6 5.6 0 0 1 6.2 2.8a5.6 5.6 0 1 0 7 7Z" />
  </svg>
);
const AUTO = (
  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="1.4" y="2.6" width="13.2" height="9" />
    <path d="M5.4 13.9h5.2" />
  </svg>
);

function ThemeSwitch({
  mode,
  setMode,
  t,
}: {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  t: Dict;
}) {
  const opts: { k: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { k: "light", icon: SUN, label: t.ui.light },
    { k: "dark", icon: MOON, label: t.ui.dark },
    { k: "system", icon: AUTO, label: t.ui.system },
  ];
  return (
    <div className="flex border border-line" role="group" aria-label={t.ui.theme}>
      {opts.map((o) => (
        <button
          key={o.k}
          onClick={() => setMode(o.k)}
          title={o.label}
          aria-label={o.label}
          aria-pressed={mode === o.k}
          className={`grid h-8 w-8 place-items-center border-r border-line transition-colors duration-150 last:border-r-0 ${
            mode === o.k ? "bg-ink text-paper" : "text-warm hover:bg-paper-2 hover:text-ink"
          }`}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}

function LangSwitch({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex border border-line" role="group" aria-label="Language">
      {(["zh", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`micro h-8 px-2.5 border-r border-line transition-colors duration-150 last:border-r-0 ${
            lang === l ? "bg-ink text-paper" : "text-warm hover:bg-paper-2 hover:text-ink"
          }`}
        >
          {l === "zh" ? "中" : "EN"}
        </button>
      ))}
    </div>
  );
}

export function Header({
  t,
  lang,
  setLang,
  mode,
  setMode,
  currentView,
  scrolled,
  onNavigate,
}: {
  t: Dict;
  lang: Lang;
  setLang: (l: Lang) => void;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  currentView: "home" | "docs";
  scrolled: boolean;
  onNavigate: (view: "home" | "docs", docId?: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 z-50 border-b-2 border-line bg-paper/95 backdrop-blur-sm transition-shadow duration-200 ${
        scrolled ? "shadow-[0_2px_0_0_var(--p-orange)]" : ""
      }`}
    >
      <div className="mx-auto flex h-[60px] w-full max-w-[1340px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate("home");
          }}
          className="flex shrink-0 items-center gap-2.5"
        >
          <Mark className="h-7 w-7" />
          <span className="font-display text-[20px] font-black leading-none tracking-[-0.03em] text-ink">
            LWDT
          </span>
          <span className="micro hidden text-warm-2 xl:inline">/ ESP-IDF</span>
        </a>

        {/* Primary Site Navigation */}
        <nav className="ml-5 hidden items-center gap-1 md:flex">
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("home");
            }}
            className={`relative px-3.5 py-2 font-mono text-[13.5px] tracking-wide transition-colors duration-150 ${
              currentView === "home" ? "font-semibold text-ink" : "text-warm hover:text-ink"
            }`}
          >
            {t.ui.home}
            {currentView === "home" && (
              <span className="absolute inset-x-3.5 -bottom-[13px] h-[3px] bg-orange" />
            )}
          </a>

          <a
            href="#/docs/overview"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("docs", "overview");
            }}
            className={`relative px-3.5 py-2 font-mono text-[13.5px] tracking-wide transition-colors duration-150 ${
              currentView === "docs" ? "font-semibold text-ink" : "text-warm hover:text-ink"
            }`}
          >
            {t.ui.docs}
            {currentView === "docs" && (
              <span className="absolute inset-x-3.5 -bottom-[13px] h-[3px] bg-orange" />
            )}
          </a>

          <a
            href="#/docs/api-macros"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("docs", "api-macros");
            }}
            className="relative px-3.5 py-2 font-mono text-[13.5px] tracking-wide text-warm transition-colors duration-150 hover:text-ink"
          >
            {t.ui.api}
          </a>
        </nav>

        {/* Right utility toolbar */}
        <div className="ml-auto flex items-center gap-2.5">
          <LangSwitch lang={lang} setLang={setLang} />
          <div className="hidden sm:block">
            <ThemeSwitch mode={mode} setMode={setMode} t={t} />
          </div>
          <a
            href={GH}
            target="_blank"
            rel="noreferrer"
            className="micro hidden h-8 items-center border border-line bg-ink px-3 text-paper transition-colors duration-150 hover:border-orange hover:bg-orange hover:text-on-orange sm:flex"
          >
            GITHUB ↗
          </a>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="micro h-8 border border-line px-3 text-ink transition-colors duration-150 hover:bg-paper-2 md:hidden"
          >
            {open ? `${t.ui.close} ×` : `${t.ui.menu} ☰`}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-line-soft bg-paper md:hidden">
          <nav className="mx-auto flex flex-col divide-y divide-line-soft px-4 py-2">
            <a
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                onNavigate("home");
              }}
              className={`py-3 text-[14.5px] font-medium ${
                currentView === "home" ? "text-orange-ink" : "text-ink"
              }`}
            >
              {t.ui.home}
            </a>
            <a
              href="#/docs/overview"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                onNavigate("docs", "overview");
              }}
              className={`py-3 text-[14.5px] font-medium ${
                currentView === "docs" ? "text-orange-ink" : "text-ink"
              }`}
            >
              {t.ui.docs}
            </a>
            <a
              href="#/docs/api-macros"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                onNavigate("docs", "api-macros");
              }}
              className="py-3 text-[14.5px] font-medium text-ink"
            >
              {t.ui.api}
            </a>
          </nav>
          <div className="flex items-center justify-between gap-3 border-t border-line-soft px-4 py-3 sm:hidden">
            <ThemeSwitch mode={mode} setMode={setMode} t={t} />
            <a
              href={GH}
              target="_blank"
              rel="noreferrer"
              className="micro flex h-8 items-center border border-line bg-ink px-3 text-paper"
            >
              GITHUB ↗
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
