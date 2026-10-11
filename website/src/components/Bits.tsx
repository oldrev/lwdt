import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Dict } from "../i18n";
import { Mark } from "./Header";

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setSeen(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${seen ? "is-in" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function Section({
  id,
  children,
  alt = false,
}: {
  id?: string;
  children: ReactNode;
  alt?: boolean;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 border-t-2 border-line px-4 py-16 sm:px-6 lg:px-8 lg:py-24 ${
        alt ? "bg-paper-2" : "bg-paper"
      }`}
    >
      <div className="mx-auto w-full max-w-[1200px]">{children}</div>
    </section>
  );
}

export function SectionHead({
  num,
  en,
  title,
  lead,
  center = false,
}: {
  num: string;
  en: string;
  title: string;
  lead?: ReactNode;
  center?: boolean;
}) {
  return (
    <header className={`mb-10 ${center ? "mx-auto max-w-[760px] text-center" : ""}`}>
      <div className="flex items-center gap-4 border-b-2 border-line pb-2.5">
        <span className="micro text-orange-ink">§ {num}</span>
        <span className="micro text-warm">{en}</span>
        <span className="hatch ml-auto h-2.5 w-10" />
      </div>
      <h2 className="mt-6 font-display text-[clamp(1.85rem,4.4vw,2.9rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-ink">
        {title}
      </h2>
      {lead && (
        <p className={`mt-4 text-[15.5px] leading-[1.95] text-ink-2 ${center ? "mx-auto" : "max-w-[66ch]"}`}>
          {lead}
        </p>
      )}
    </header>
  );
}

export function Footer({ t }: { t: Dict }) {
  return (
    <footer className="relative overflow-hidden border-t-2 border-line bg-panel text-panel-fg">
      <div className="grain relative mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-10">
          <div>
            <div className="flex items-center gap-3">
              <Mark className="h-9 w-9" invert />
              <span className="font-display text-[clamp(2.2rem,6vw,3.8rem)] font-black leading-[0.85] tracking-[-0.04em]">
                LWDT
              </span>
            </div>
            <p className="mt-5 max-w-[48ch] text-[14px] leading-[1.9] opacity-75">{t.footer.desc}</p>
          </div>
          <div className="flex flex-col gap-2.5">
            {t.footer.links.map((a) => (
              <a
                key={a.h}
                href={a.h}
                target="_blank"
                rel="noreferrer"
                className="micro border-b border-warm-2/50 pb-1.5 opacity-70 transition-colors duration-150 hover:text-hazard hover:opacity-100"
              >
                {a.l}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-warm-2/40 pt-5">
          <span className="micro opacity-60">APACHE LICENSE 2.0</span>
          <span className="micro opacity-60">COPYRIGHT © 2026 WEI LI</span>
          <a href="#top" className="micro text-hazard">
            ↑ {t.ui.backTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
