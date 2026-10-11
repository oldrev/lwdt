import { BOOT_LEVELS, BOOT_ORDER, type Dict } from "../i18n";

const STYLE: Record<string, { bar: string; text: string; chip: string }> = {
  EARLY: { bar: "bg-paper-3", text: "text-ink", chip: "bg-paper-3 text-ink" },
  PRE_KERNEL_1: { bar: "bg-panel", text: "text-panel-fg", chip: "bg-panel text-panel-fg" },
  PRE_KERNEL_2: { bar: "bg-orange", text: "text-on-orange", chip: "bg-orange text-on-orange" },
  POST_KERNEL: { bar: "bg-warm", text: "text-paper", chip: "bg-warm text-paper" },
  APPLICATION: { bar: "bg-signal", text: "text-paper", chip: "bg-signal text-paper" },
};

const SHORT: Record<string, string> = {
  EARLY: "EARLY",
  PRE_KERNEL_1: "PRE-1",
  PRE_KERNEL_2: "PRE-2",
  POST_KERNEL: "POST",
  APPLICATION: "APPL",
};

export function BootTimeline({ t }: { t: Dict }) {
  const counts = BOOT_LEVELS.map((l) => BOOT_ORDER.filter(([lv]) => lv === l).length);

  return (
    <div>
      <div className="border-2 border-line bg-paper-2 p-3 sm:p-4">
        <div className="mb-2 flex items-end justify-between gap-3">
          <span className="micro text-orange-ink">{t.boot.reset}</span>
          <span className="micro text-warm">{t.boot.end}</span>
        </div>
        <div className="flex h-14 w-full overflow-hidden border border-line">
          {BOOT_LEVELS.map((l, i) => (
            <div
              key={l}
              style={{ flexGrow: counts[i] }}
              className={`${STYLE[l].bar} ${STYLE[l].text} flex min-w-0 items-center justify-center border-r border-paper/40 last:border-r-0`}
            >
              <span className="micro truncate px-1">{SHORT[l]}</span>
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5">
          {BOOT_LEVELS.map((l) => (
            <span key={l} className="micro flex items-center gap-1.5 text-warm">
              <span className={`inline-block h-2 w-2 ${STYLE[l].bar}`} />
              {l}
            </span>
          ))}
        </div>
        <div className="mt-3 border-t border-line-soft pt-3 font-mono text-[11.5px] leading-relaxed text-warm">
          {t.boot.legend}
        </div>
      </div>

      <div className="mt-8 border-t-2 border-line">
        {BOOT_ORDER.map(([level, prio], i) => (
          <div
            key={`${level}-${prio}`}
            className="grid gap-x-5 gap-y-2 border-b border-line-soft py-3.5 transition-colors duration-150 hover:bg-paper-2 sm:grid-cols-[8.5rem_2.5rem_1fr]"
          >
            <div>
              <span className={`micro inline-block px-1.5 py-1 ${STYLE[level].chip}`}>{level}</span>
            </div>
            <div className="tnum font-mono text-[13px] font-medium text-orange-ink sm:pt-1.5">{prio}</div>
            <div>
              <div className="text-[14.5px] font-medium leading-snug text-ink">{t.boot.rows[i].use}</div>
              <div className="mt-1 text-[13px] leading-relaxed text-warm">{t.boot.rows[i].note}</div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 max-w-[74ch] text-[14px] leading-[1.95] text-ink-2">{t.boot.foot}</p>
    </div>
  );
}
