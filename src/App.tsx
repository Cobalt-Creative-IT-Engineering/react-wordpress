import { useEffect } from "react";
import { useRoute } from "./hooks/useRoute";
import { Nav, Footer } from "./components/layout";
import { ErrorBanner } from "./components/ui";
import { HomePage }          from "./pages/HomePage";
import { ProgrammationPage } from "./pages/ProgrammationPage";
import { InfosPratiquesPage }     from "./pages/InfosPratiquesPage";
import { InfosPratiques2Page }    from "./pages/InfosPratiques2Page";
import { LeFestivalPage }         from "./pages/LeFestivalPage";
import { LeFestival2Page }        from "./pages/LeFestival2Page";
import { AncieneEditionPage }     from "./pages/AncieneEditionPage";
import { ActualiteDetailPage }    from "./pages/ActualiteDetailPage";
import { WPPageView }        from "./pages/WPPageView";
import { ACTIVE_THEME }      from "./config/site";
import { THEMES }            from "./themes/index";
import { Decorations }       from "./themes/Decorations";

// ─── Application du thème ─────────────────────────────────────────────────────
// Exécuté de façon synchrone au chargement du module, avant le premier rendu
// React — garantit zéro flash de contenu non stylé (FOUC).
const _theme = THEMES[ACTIVE_THEME];
document.documentElement.classList.add(_theme.cssClass);
if (_theme.fontsUrl) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = _theme.fontsUrl;
  document.head.appendChild(link);
}
// ──────────────────────────────────────────────────────────────────────────────

export default function App() {
  const { route, slug } = useRoute();

  // Remonte en haut à chaque changement de route
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [route]);

  return (
    <div className="app">
      <Decorations />
      <Nav />
      <PageView route={route} slug={slug} />
      <Footer />
    </div>
  );
}

function PageView({ route, slug }: { route: string; slug: string | null }) {
  if (route === "#/" || route === "")        return <HomePage />;
  if (route === "#/programmation")           return <ProgrammationPage />;
  if (route === "#/informations")            return <InfosPratiquesPage />;
  if (route === "#/festival")                return <LeFestivalPage />;
  if (route === "#/le-festival")             return <LeFestivalPage />;
  if (route === "#/festival-2")              return <LeFestival2Page />;
  if (route === "#/informations-2")          return <InfosPratiques2Page />;
  if (route.startsWith("#/edition/"))        return <AncieneEditionPage slug={route.replace("#/edition/", "")} />;
  if (route.startsWith("#/actualite/"))      return <ActualiteDetailPage slug={route.replace("#/actualite/", "")} />;
  if (route.startsWith("#/page/") && slug)   return <WPPageView slug={slug} />;
  return <ErrorBanner message="Page non trouvée" />;
}
