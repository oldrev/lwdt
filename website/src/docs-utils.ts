import { isValidElement, type ReactNode } from "react";

export type TocItem = { id: string; text: string; level: 2 | 3 };

/** Stable anchor id for a heading, shared by the renderer and the table of contents. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-_]/gu, "");
}

/** Flatten a React node tree into plain text so heading ids stay stable. */
export function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) {
    return textOf((node.props as { children?: ReactNode }).children);
  }
  return "";
}

/** Collect h2/h3 headings, ignoring fenced code blocks. */
export function extractHeadings(source: string): TocItem[] {
  const items: TocItem[] = [];
  let inFence = false;

  for (const raw of source.split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.*)$/.exec(line);
    if (!match) continue;

    const text = match[2].replace(/[`*_~]/g, "").trim();
    if (!text) continue;
    items.push({ id: slugify(text), text, level: match[1].length as 2 | 3 });
  }

  return items;
}

const ADMONITION_LABEL: Record<string, string> = {
  note: "NOTE",
  info: "INFO",
  tip: "TIP",
  warning: "WARNING",
  danger: "DANGER",
  caution: "CAUTION",
};

/**
 * Convert Docusaurus-style admonitions into blockquotes:
 *
 * :::warning[Title]
 * body
 * :::
 */
export function preprocessAdmonitions(source: string): string {
  const out: string[] = [];
  let active: string | null = null;

  for (const line of source.split("\n")) {
    const open = /^:::\s*(note|info|tip|warning|danger|caution)(?:\[(.*)\])?\s*$/.exec(line.trim());

    if (open) {
      const kind = open[1];
      const title = (open[2] ?? "").trim();
      active = kind;
      const label = ADMONITION_LABEL[kind] ?? "NOTE";
      out.push(`> **${title ? `${label} · ${title}` : label}**`);
      out.push(">");
      continue;
    }

    if (active && line.trim() === ":::") {
      active = null;
      continue;
    }

    out.push(active ? (line.trim() === "" ? ">" : `> ${line}`) : line);
  }

  return out.join("\n");
}
