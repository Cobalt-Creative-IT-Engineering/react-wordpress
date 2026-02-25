import React, { useMemo, useState } from "react";
import { usePage, useACFOptions, useCPT, useTaxonomyTerms } from "./hooks/useWordPress";
import { acfImage } from "./components/ACFRenderer";
import {
  PostCardSkeleton,
  WPContent,
  Nav,
  ErrorBanner,
  Skeleton,
} from "./components/UI";

function useRoute() {
  const [hash, setHash] = useState(window.location.hash || "#/");
  React.useEffect(() => {
    const update = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  return hash;
}

function WPPageView({ slug }: { slug: string }) {
  const { status, data: page, error } = usePage(slug);

  if (status === "loading")
    return (
      <main className="page-content">
        <Skeleton className="h-8 w-1/2 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </main>
    );

  if (status === "error") return <ErrorBanner message={error} />;
  if (!page) return <ErrorBanner message="Page introuvable" />;

  const hasACF = Object.keys(page.acf).length > 0;

  return (
    <main className="page-content">
      <h1 className="page-title">{page.title}</h1>
      <WPContent html={page.content} />
      {hasACF && (
        <section className="acf-section">
          <h2 className="acf-section-title">Champs ACF</h2>
          <div className="text-text-secondary text-sm">Champs ACF disponibles dans cette page.</div>
        </section>
      )}
    </main>
  );
}

function readACFString(acf: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = acf[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function FestivalHomePage() {
  const { status, data: options } = useACFOptions();

  const acf = (status === "success" ? (options as Record<string, unknown>) : {}) ?? {};
  const heroTitle = readACFString(acf, "hero_title", "site_headline") || "Festival d'ete";
  const heroSubtitle =
    readACFString(acf, "hero_subtitle") || "Musique, arts et nuits longues au coeur de la ville";
  const heroVideoUrl = readACFString(acf, "hero_video_url", "video_hero");
  const heroLogo = acfImage(acf, "hero_logo");

  return (
    <main className="page-content festival-home">
      <section className="festival-hero">
        {heroVideoUrl ? (
          <video className="hero-video" autoPlay muted loop playsInline src={heroVideoUrl} />
        ) : (
          <div className="hero-video hero-fallback" />
        )}
        <div className="hero-overlay" />
        <div className="hero-content">
          {heroLogo && (
            <img src={heroLogo.url} alt={heroLogo.alt} className="hero-logo" />
          )}
          <div className="hero-text-block">
            <p className="hero-kicker">Festival</p>
            <h1 className="hero-title">{heroTitle}</h1>
            <p className="hero-sub">{heroSubtitle}</p>
            <div className="hero-ctas">
              <a href="#/programmation" className="btn-primary">
                Voir la programmation
              </a>
              <a href="#/billetterie" className="btn-ghost">
                Billetterie
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
type ProgrammationEntry = {
  id: number;
  slug: string;
  date?: string;
  title?: { rendered?: string };
  acf?: Record<string, unknown>;
  jour?: number[];
  lieu?: number[];
};

function ProgrammationPage() {
  const { status, data, error } = useCPT<ProgrammationEntry>("programmation", {
    perPage: 100,
    orderby: "date",
    order: "asc",
  });
  const { data: jourTerms, status: jourStatus } = useTaxonomyTerms("jour");
  const { data: lieuTerms, status: lieuStatus } = useTaxonomyTerms("lieu");

  const [selectedJour, setSelectedJour] = useState<number | null>(null);
  const [selectedLieu, setSelectedLieu] = useState<number | null>(null);

  const jourMap = useMemo(
    () => new Map((jourTerms ?? []).map((t) => [t.id, t.name])),
    [jourTerms]
  );
  const lieuMap = useMemo(
    () => new Map((lieuTerms ?? []).map((t) => [t.id, t.name])),
    [lieuTerms]
  );

  const items = data ?? [];

  const filtered = items.filter((item) => {
    const matchJour = selectedJour ? (item.jour ?? []).includes(selectedJour) : true;
    const matchLieu = selectedLieu ? (item.lieu ?? []).includes(selectedLieu) : true;
    return matchJour && matchLieu;
  });

  if (status === "loading") {
    return (
      <main className="page-content">
        <div className="page-header">
          <h1 className="page-title">Programmation</h1>
          <p className="page-subtitle">Filtre par jour et par lieu</p>
        </div>
        <div className="program-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </main>
    );
  }

  if (status === "error") return <ErrorBanner message={error} />;

  return (
    <main className="page-content">
      <div className="page-header">
        <h1 className="page-title">Programmation</h1>
        <p className="page-subtitle">Filtre par jour et par lieu</p>
      </div>

      <div className="program-filters">
        <div className="filter-group">
          <span className="filter-label">Jour</span>
          <button
            className={`filter-chip ${selectedJour === null ? "active" : ""}`}
            onClick={() => setSelectedJour(null)}
          >
            Tout
          </button>
          {(jourTerms ?? []).map((term) => (
            <button
              key={term.id}
              className={`filter-chip ${selectedJour === term.id ? "active" : ""}`}
              onClick={() => setSelectedJour(term.id)}
              disabled={jourStatus === "loading"}
            >
              {term.name}
            </button>
          ))}
        </div>

        <div className="filter-group">
          <span className="filter-label">Lieu</span>
          <button
            className={`filter-chip ${selectedLieu === null ? "active" : ""}`}
            onClick={() => setSelectedLieu(null)}
          >
            Tout
          </button>
          {(lieuTerms ?? []).map((term) => (
            <button
              key={term.id}
              className={`filter-chip ${selectedLieu === term.id ? "active" : ""}`}
              onClick={() => setSelectedLieu(term.id)}
              disabled={lieuStatus === "loading"}
            >
              {term.name}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <ErrorBanner message="Aucun artiste pour ces filtres." />
      ) : (
        <div className="program-grid">
          {filtered.map((item) => {
            const acf = item.acf ?? {};
            const artiste = readACFString(acf, "artiste") || item.title?.rendered || "Artiste";
            const jourLabels = (item.jour ?? []).map((id) => jourMap.get(id)).filter(Boolean) as string[];
            const lieuLabels = (item.lieu ?? []).map((id) => lieuMap.get(id)).filter(Boolean) as string[];

            return (
              <article key={item.id} className="program-card">
                <h3 className="program-artist">{artiste}</h3>
                <div className="program-meta">
                  {jourLabels.map((label) => (
                    <span key={`jour-${label}`} className="tag">
                      {label}
                    </span>
                  ))}
                  {lieuLabels.map((label) => (
                    <span key={`lieu-${label}`} className="tag tag-muted">
                      {label}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

type SidebarLink = { label: string; url: string };

function extractSidebarLinks(acf: Record<string, unknown>): SidebarLink[] {
  const candidates = ["sidebar_links", "links", "liens", "navigation"];
  for (const key of candidates) {
    const raw = acf[key];
    if (Array.isArray(raw)) {
      return raw
        .map((item) => {
          if (typeof item !== "object" || item === null) return null;
          const label =
            (item as Record<string, unknown>).label ||
            (item as Record<string, unknown>).title ||
            (item as Record<string, unknown>).text;
          const url =
            (item as Record<string, unknown>).url ||
            (item as Record<string, unknown>).link ||
            (item as Record<string, unknown>).href;
          if (typeof label === "string" && typeof url === "string") {
            return { label, url };
          }
          return null;
        })
        .filter(Boolean) as SidebarLink[];
    }
  }
  return [];
}

function TwoColumnPage({ slug, title }: { slug: string; title: string }) {
  const { status, data: page, error } = usePage(slug);

  if (status === "loading") {
    return (
      <main className="page-content">
        <Skeleton className="h-8 w-1/2 mb-6" />
        <div className="two-col">
          <div className="side-links">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          <div className="content-column">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (status === "error") return <ErrorBanner message={error} />;
  if (!page) return <ErrorBanner message="Page introuvable" />;

  const acf = page.acf ?? {};
  const links = extractSidebarLinks(acf);
  const linksHtml = readACFString(acf, "liens_html", "links_html");

  return (
    <main className="page-content">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="two-col">
        <aside className="side-links">
          {links.length > 0 ? (
            links.map((link) => (
              <a key={link.url} href={link.url} className="side-link">
                {link.label}
              </a>
            ))
          ) : linksHtml ? (
            <WPContent html={linksHtml} />
          ) : (
            <p className="text-text-muted text-sm">Ajoute des liens dans ACF (liens ou sidebar_links).</p>
          )}
        </aside>
        <section className="content-column">
          <WPContent html={page.content} />
        </section>
      </div>
    </main>
  );
}

function BilletteriePage() {
  const { status, data: options } = useACFOptions();
  const acf = (status === "success" ? (options as Record<string, unknown>) : {}) ?? {};
  const ticketUrl =
    readACFString(acf, "billetterie_url", "ticketing_url") ||
    import.meta.env.VITE_TICKETING_URL ||
    "";

  return (
    <main className="page-content">
      <div className="page-header">
        <h1 className="page-title">Billetterie</h1>
        <p className="page-subtitle">Reserve tes places en ligne</p>
      </div>
      {ticketUrl ? (
        <div className="ticket-wrapper">
          <iframe
            className="ticket-frame"
            src={ticketUrl}
            title="Billetterie"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <ErrorBanner message="Ajoute une URL de billetterie dans ACF (billetterie_url)." />
      )}
    </main>
  );
}

const NAV_ITEMS = [
  { id: 1, title: "Accueil", url: "#/" },
  { id: 2, title: "Programmation", url: "#/programmation" },
  { id: 3, title: "Informations", url: "#/informations" },
  { id: 4, title: "Histoire", url: "#/histoire" },
  { id: 5, title: "Billetterie", url: "#/billetterie" },
];

export default function App() {
  const route = useRoute();

  let view: React.ReactNode;

  if (route === "#/" || route === "") {
    view = <FestivalHomePage />;
  } else if (route === "#/programmation") {
    view = <ProgrammationPage />;
  } else if (route === "#/informations") {
    view = <TwoColumnPage slug="informations" title="Informations" />;
  } else if (route === "#/histoire") {
    view = <TwoColumnPage slug="histoire" title="Histoire" />;
  } else if (route === "#/billetterie") {
    view = <BilletteriePage />;
  } else if (route.startsWith("#/page/")) {
    const slug = route.replace("#/page/", "");
    view = <WPPageView slug={slug} />;
  } else {
    view = <ErrorBanner message="Page non trouvée" />;
  }

  return (
    <div className="app">
      <Nav items={NAV_ITEMS} siteName="Mon Site WP" />
      {view}
      <footer className="footer">
        <p className="footer-text">
          Propulsé par{" "}
          <a href="https://wordpress.org" target="_blank" rel="noreferrer">
            WordPress
          </a>
          {" "}×{" "}
          <a href="https://react.dev" target="_blank" rel="noreferrer">
            React
          </a>
        </p>
      </footer>
    </div>
  );
}
