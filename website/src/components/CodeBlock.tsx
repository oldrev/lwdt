import { useState } from "react";
import type { Dict } from "../i18n";

type Tone = "dark" | "paper";

const TONE = {
  dark: {
    box: "bg-code-bg border-line",
    tab: "bg-code-tab text-warm border-white/10",
    code: "text-code-fg",
    comment: "text-warm",
    str: "text-hazard",
    num: "text-orange",
    btn: "border-white/20 text-warm hover:border-orange hover:text-orange",
    cap: "border-white/10 text-warm",
  },
  paper: {
    box: "bg-paper-2 border-line",
    tab: "bg-paper-3 text-warm border-line-soft",
    code: "text-ink",
    comment: "text-warm italic",
    str: "text-signal",
    num: "text-orange-ink",
    btn: "border-line-soft text-warm hover:border-orange-ink hover:text-orange-ink",
    cap: "border-line-soft text-warm",
  },
};

function Line({ text, tone }: { text: string; tone: Tone }) {
  const t = TONE[tone];
  const trimmed = text.trimStart();
  if (
    trimmed.startsWith("//") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("# ")
  ) {
    return <span className={t.comment}>{text || " "}</span>;
  }
  const chunks = text.split(/("(?:[^"\\]|\\.)*")/g);
  return (
    <>
      {chunks.map((chunk, i) => {
        if (chunk.startsWith('"') && chunk.endsWith('"') && chunk.length > 1) {
          return (
            <span key={i} className={t.str}>
              {chunk}
            </span>
          );
        }
        const sub = chunk.split(/(\b\d+\b)/g);
        return (
          <span key={i}>
            {sub.map((s, j) =>
              /^\d+$/.test(s) ? (
                <span key={j} className={t.num}>
                  {s}
                </span>
              ) : (
                <span key={j}>{s}</span>
              )
            )}
          </span>
        );
      })}
    </>
  );
}

export function CodeBlock({
  code,
  file,
  tone = "dark",
  highlight = [],
  caption,
  t,
}: {
  code: string;
  file?: string;
  tone?: Tone;
  highlight?: number[];
  caption?: string;
  t: Dict;
}) {
  const [copied, setCopied] = useState(false);
  const s = TONE[tone];
  const lines = code.replace(/\n+$/, "").split("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`h-full border ${s.box}`}>
      <div className={`flex items-center justify-between gap-3 border-b ${s.tab}`}>
        <span className="micro truncate px-3 py-2.5">{file || t.ui.snippet}</span>
        <button
          onClick={copy}
          className={`micro mr-2 shrink-0 border px-2 py-1 transition-colors duration-150 ${s.btn}`}
        >
          {copied ? t.ui.copied : t.ui.copy}
        </button>
      </div>
      <pre className={`overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-[1.75] sm:text-[13px] ${s.code}`}>
        <code>
          {lines.map((l, i) => (
            <div
              key={i}
              className={
                highlight.includes(i)
                  ? tone === "dark"
                    ? "-mx-4 border-l-2 border-orange bg-orange/20 px-4"
                    : "-mx-4 border-l-2 border-orange bg-hazard/40 px-4"
                  : undefined
              }
            >
              <Line text={l} tone={tone} />
            </div>
          ))}
        </code>
      </pre>
      {caption && (
        <div className={`border-t px-4 py-2.5 font-mono text-[11.5px] leading-relaxed ${s.cap}`}>
          {caption}
        </div>
      )}
    </div>
  );
}
