import { useMemo, type ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { preprocessAdmonitions, slugify, textOf } from "../docs-utils";

function languageOf(children: ReactNode): string {
  if (!Array.isArray(children)) return "code";
  const first = children[0];
  if (!first || typeof first !== "object" || !("props" in first)) return "code";
  const className = (first.props as { className?: string }).className ?? "";
  const match = /language-([\w-]+)/.exec(className);
  return match ? match[1] : "code";
}

export function MarkdownDoc({ source }: { source: string }) {
  const prepared = useMemo(() => preprocessAdmonitions(source), [source]);

  return (
    <article className="markdown">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: (props) => <h2 id={slugify(textOf(props.children))}>{props.children}</h2>,
          h3: (props) => <h3 id={slugify(textOf(props.children))}>{props.children}</h3>,
          pre: (props) => (
            <div className="md-code">
              <div className="md-code__bar">
                <span className="micro">{languageOf(props.children)}</span>
                <span className="micro opacity-60">LWDT</span>
              </div>
              <pre>{props.children}</pre>
            </div>
          ),
        }}
      >
        {prepared}
      </Markdown>
    </article>
  );
}
