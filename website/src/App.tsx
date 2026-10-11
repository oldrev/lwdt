import { useEffect } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Bits";
import { HomePage } from "./pages/HomePage";
import { DocsPage } from "./pages/DocsPage";
import { useLang, useTheme, useHashRoute, useScrolled } from "./hooks";
import { DICT } from "./i18n";

export default function App() {
  const { lang, setLang } = useLang();
  const { mode, setMode } = useTheme();
  const { route, navigate } = useHashRoute();
  const scrolled = useScrolled();

  const t = DICT[lang];

  useEffect(() => {
    document.documentElement.lang = t.htmlLang;
    document.title =
      route.view === "docs"
        ? `${t.ui.docs} · ${t.title}`
        : t.title;
  }, [t, route.view]);

  return (
    <div className="flex min-h-screen flex-col bg-paper" id="top">
      {/* Top Navbar */}
      <Header
        t={t}
        lang={lang}
        setLang={setLang}
        mode={mode}
        setMode={setMode}
        currentView={route.view}
        scrolled={scrolled}
        onNavigate={navigate}
      />

      {/* Main View: Landing Page or Documentation Page */}
      <div className="flex-1">
        {route.view === "home" ? (
          <HomePage t={t} lang={lang} onNavigate={navigate} />
        ) : (
          <DocsPage
            t={t}
            lang={lang}
            currentDocId={route.docId}
            onNavigate={navigate}
          />
        )}
      </div>

      {/* Unified Site Footer */}
      <Footer t={t} />
    </div>
  );
}
