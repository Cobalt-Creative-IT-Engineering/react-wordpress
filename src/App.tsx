import { useEffect } from "react";
import { useRoute, navigate } from "./hooks/useRoute";
import { Nav, Footer } from "./components/layout";
import { ErrorBanner } from "./components/ui";
import { HomePage }          from "./pages/HomePage";
import { ProgrammationPage } from "./pages/ProgrammationPage";
import { InfosPratiquesPage }     from "./pages/InfosPratiquesPage";
import { LeFestivalPage }         from "./pages/LeFestivalPage";
import { AncieneEditionPage }     from "./pages/AncieneEditionPage";
import { ActualiteDetailPage }    from "./pages/ActualiteDetailPage";
import { MentionsLegalesPage }    from "./pages/MentionsLegalesPage";
import { ConditionsGeneralesPage } from "./pages/ConditionsGeneralesPage";
import { BilletteriePage }    from "./pages/BilletteriePage";
import { WPPageView }        from "./pages/WPPageView";
import { ACTIVE_THEME }      from "./config/site";
import { THEMES }            from "./themes/index";
import { Decorations }       from "./themes/Decorations";
import { initMeta, setPageMeta } from "./lib/meta";
import { prefetchFestivalData, useGraphQLPageAttente } from "./hooks/useWordPress";
import { PageAttentePage } from "./pages/PageAttentePage";
import { FORCE_WAITING_PAGE } from "./config/site";

// ─── Application du thème ─────────────────────────────────────────────────────
const _theme = THEMES[ACTIVE_THEME];
document.documentElement.classList.add(_theme.cssClass);
if (_theme.fontsUrl) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = _theme.fontsUrl;
  document.head.appendChild(link);
}

// ─── Intercepteur de liens SPA (History API) ──────────────────────────────────
// Intercepte tous les clics sur <a href="/..."> locaux pour éviter le rechargement.
document.addEventListener("click", (e) => {
  const a = (e.target as Element).closest("a");
  if (!a) return;
  const href = a.getAttribute("href");
  if (!href) return;
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
  if (a.getAttribute("target") === "_blank") return;
  if (a.getAttribute("download") != null) return;
  // Anciens liens hash "/#/festival" → migrer vers "/festival"
  if (href.startsWith("/#/")) {
    e.preventDefault();
    navigate(href.slice(2)); // "/#/festival" → "/festival"
    return;
  }
  if (href.startsWith("#")) return; // ancres de page (#section) → laisser le navigateur
  e.preventDefault();
  navigate(href);
});
// ─── Mode grab stickers (Shift enfoncé) ──────────────────────────────────────
// Shift tenu → les stickers passent au premier plan pour être attrapables.
document.addEventListener("keydown", (e) => {
  if (e.key === "Shift") document.documentElement.classList.add("sticker-grab-mode");
});
document.addEventListener("keyup", (e) => {
  if (e.key === "Shift") document.documentElement.classList.remove("sticker-grab-mode");
});
// ──────────────────────────────────────────────────────────────────────────────

const PAGE_LABELS: Record<string, string> = {
  "/programmation": "Programmation",
  "/informations":  "Infos pratiques",
  "/festival":      "Le Festival",
  "/le-festival":   "Le Festival",
  "/billetterie":   "Billetterie",
};

function getPageLabel(route: string): string | undefined {
  if (route === "/" || route === "") return undefined;
  if (PAGE_LABELS[route]) return PAGE_LABELS[route];
  if (route.startsWith("/programmation/")) return "Programmation";
  if (route.startsWith("/edition/"))       return "Archives";
  if (route.startsWith("/actualite/"))     return "Actualités";
  return undefined;
}


export default function App() {
  const { route, slug, anchor } = useRoute();
  const { data: waitData, status: waitStatus, refetch: refetchWait } = useGraphQLPageAttente();

  // Calcul anticipé de displayDate (nécessaire pour l'effet ci-dessous)
  const waitFields     = waitData?.pageDattente?.pageAttente ?? null;
  const displayDateStr = waitFields?.dateDaffichageDuSite ?? null;
  // ACF date_time_picker retourne l'heure locale avec +00:00 (offset incorrect).
  // On strip le timezone pour que JS parse en heure locale du navigateur.
  const displayDate = displayDateStr
    ? new Date(displayDateStr.replace(/[+-]\d{2}:\d{2}$/, ""))
    : null;

  // Infos du site WordPress (une seule fois) → initialise le module meta
  useEffect(() => {
    fetch("/wp-json/")
      .then((r) => r.json())
      .then((d) => { initMeta(d?.name ?? "", d?.description ?? ""); })
      .catch(() => {});
    prefetchFestivalData();
  }, []);

  // Meta par défaut selon la route (les pages de détail écrasent avec leurs propres infos)
  useEffect(() => {
    setPageMeta({ title: getPageLabel(route) });
  }, [route]);

  // Scroll : ancre si présente, sinon remonte en haut
  useEffect(() => {
    if (anchor) {
      const t = setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [route, anchor]);

  // Vide le cache et re-fetch exactement quand la date d'ouverture arrive.
  // Évite qu'un user chargé avant la date reste bloqué pendant toute la durée du cache.
  useEffect(() => {
    if (!displayDate) return;
    const msUntil = displayDate.getTime() - Date.now();
    if (msUntil <= 0) return;
    const t = setTimeout(() => {
      sessionStorage.removeItem("wp:gql-page-attente");
      refetchWait();
    }, msUntil);
    return () => clearTimeout(t);
  }, [displayDate, refetchWait]);
  if (!FORCE_WAITING_PAGE && waitStatus === "loading") return null;
  if (FORCE_WAITING_PAGE || (displayDate !== null && new Date() < displayDate)) {
    return <PageAttentePage fields={waitFields} />;
  }

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
  if (route === "/" || route === "")        return <HomePage />;
  if (route === "/programmation")           return <ProgrammationPage />;
  if (route.startsWith("/programmation/"))  return <ProgrammationPage initialSlug={route.replace("/programmation/", "")} />;
  if (route === "/informations")            return <InfosPratiquesPage />;
  if (route === "/festival")                return <LeFestivalPage />;
  if (route === "/le-festival")             return <LeFestivalPage />;
  if (route.startsWith("/edition/"))        return <AncieneEditionPage slug={route.replace("/edition/", "")} />;
  if (route.startsWith("/actualite/"))      return <ActualiteDetailPage slug={route.replace("/actualite/", "")} />;
  if (route === "/billetterie")             return <BilletteriePage />;
  if (route === "/mentions-legales")        return <MentionsLegalesPage />;
  if (route === "/conditions-generales")    return <ConditionsGeneralesPage />;
  if (route.startsWith("/page/") && slug)   return <WPPageView slug={slug} />;
  return <ErrorBanner message="Page non trouvée" />;
}
