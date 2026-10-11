import { useCallback, useEffect, useState } from "react";
import type { Lang } from "./i18n";

export type ThemeMode = "light" | "dark" | "system";

const THEME_KEY = "lwdt-theme";
const LANG_KEY = "lwdt-lang";

function systemDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(mode: ThemeMode) {
  const dark = mode === "dark" || (mode === "system" && systemDark());
  document.documentElement.classList.toggle("dark", dark);
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";
    const s = window.localStorage.getItem(THEME_KEY);
    return s === "light" || s === "dark" || s === "system" ? s : "system";
  });

  useEffect(() => {
    applyTheme(mode);
    try {
      window.localStorage.setItem(THEME_KEY, mode);
    } catch {
      /* ignore */
    }
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  return { mode, setMode };
}

export function useLang() {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "zh";
    const s = window.localStorage.getItem(LANG_KEY);
    if (s === "zh" || s === "en") return s;
    return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  return { lang, setLang };
}

export type RouteState = {
  view: "home" | "docs";
  docId: string;
};

export function parseHash(hash: string): RouteState {
  const clean = hash.replace(/^#\/?/, "").trim();
  if (!clean || clean === "home") {
    return { view: "home", docId: "overview" };
  }
  if (clean.startsWith("docs")) {
    const parts = clean.split("/");
    const id = parts[1] || "overview";
    return { view: "docs", docId: id };
  }
  if (clean === "api") {
    return { view: "docs", docId: "api-macros" };
  }
  if (clean.startsWith("doc-")) {
    return { view: "docs", docId: clean.replace("doc-", "") };
  }
  return { view: "home", docId: "overview" };
}

export function useHashRoute() {
  const [route, setRoute] = useState<RouteState>(() => {
    if (typeof window === "undefined") return { view: "home", docId: "overview" };
    return parseHash(window.location.hash);
  });

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash(window.location.hash));
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = useCallback((view: "home" | "docs", docId = "overview") => {
    if (view === "home") {
      window.location.hash = "#/";
    } else {
      window.location.hash = `#/docs/${docId}`;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return { route, navigate };
}

export function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}
