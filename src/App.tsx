import React, { useEffect, useMemo, useState } from "react";
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
  const normalizeRoute = (rawHash: string) => {
    const fallback = "#/";
    if (!rawHash || rawHash === "#") return fallback;
    const hash = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash;
    const pathOnly = hash.split("#")[0];
    if (!pathOnly || pathOnly === "/") return fallback;
    return `#${pathOnly}`;
  };

  const [hash, setHash] = useState(normalizeRoute(window.location.hash || "#/"));

  React.useEffect(() => {
    const update = () => setHash(normalizeRoute(window.location.hash || "#/"));
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  return hash;
}

function WPPageView({ slug }: { slug: string }) {
  const { status, data: page, error } = usePage(slug);

  if (status === "loading" && !page)
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

  if (status === "error") return <ErrorBanner message={error ?? "Erreur de chargement"} />;
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

function readACFList(acf: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = acf[key];
    if (!value) continue;

    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === "string" || typeof item === "number") return String(item);
          if (typeof item === "object" && item !== null) {
            const candidate = (item as Record<string, unknown>).name ?? (item as Record<string, unknown>).label;
            return typeof candidate === "string" ? candidate : "";
          }
          return "";
        })
        .map((entry) => entry.trim())
        .filter(Boolean);
    }

    if (typeof value === "string") {
      return value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
    }
  }
  return [] as string[];
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
  const { status, data, error } = useCPT<ProgrammationEntry>("artiste", {
    perPage: 100,
    orderby: "date",
    order: "asc",
  });
  const { data: jourTerms, status: jourStatus } = useTaxonomyTerms("jour");
  const { data: lieuTerms, status: lieuStatus } = useTaxonomyTerms("lieu");

  const [selectedJour, setSelectedJour] = useState<number | null>(null);
  const [selectedLieu, setSelectedLieu] = useState<number | null>(null);
  const [activeArtist, setActiveArtist] = useState<ProgrammationEntry | null>(null);

  const jourMap = useMemo(
    () => new Map((jourTerms ?? []).map((t) => [t.id, t.name])),
    [jourTerms]
  );
  const lieuMap = useMemo(
    () => new Map((lieuTerms ?? []).map((t) => [t.id, t.name])),
    [lieuTerms]
  );

  const items = data ?? [];

  const stats = useMemo(() => {
    const daySet = new Set<string>();
    const placeSet = new Set<string>();
    const artistSet = new Set<string>();

    items.forEach((item) => {
      const acf = item.acf ?? {};
      const artist = readACFString(acf, "artiste") || item.title?.rendered || "";
      if (artist.trim()) artistSet.add(artist.trim().toLowerCase());

      (item.jour ?? []).forEach((id) => {
        const label = jourMap.get(id) ?? `jour-${id}`;
        daySet.add(label.toLowerCase());
      });
      (item.lieu ?? []).forEach((id) => {
        const label = lieuMap.get(id) ?? `lieu-${id}`;
        placeSet.add(label.toLowerCase());
      });

      readACFList(acf, "jour", "jours").forEach((value) => daySet.add(value.toLowerCase()));
      readACFList(acf, "lieu", "lieux").forEach((value) => placeSet.add(value.toLowerCase()));
    });

    return {
      jours: Math.max(daySet.size, (jourTerms ?? []).length),
      lieux: Math.max(placeSet.size, (lieuTerms ?? []).length),
      artistes: artistSet.size,
    };
  }, [items, jourMap, lieuMap, jourTerms, lieuTerms]);

  const filtered = items.filter((item) => {
    const matchJour = selectedJour ? (item.jour ?? []).includes(selectedJour) : true;
    const matchLieu = selectedLieu ? (item.lieu ?? []).includes(selectedLieu) : true;
    return matchJour && matchLieu;
  });

  if (status === "loading" && items.length === 0) {
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

  if (status === "error") return <ErrorBanner message={error ?? "Erreur de chargement"} />;

  return (
    <main className="page-content">
      <div className="page-header">
        <h1 className="page-title">Programmation</h1>
        <p className="page-subtitle">Les artistes du festival, filtres par jour et lieu</p>
      </div>

      <section className="program-intro">
        <div className="program-intro-copy">
          <p className="program-eyebrow">Line-up 2026</p>
          <h2 className="program-heading">Trois jours, deux scenes, une ville en fete.</h2>
          <p className="program-lead">
            Selectionne un jour, un lieu, ou combine les deux pour explorer les artistes du post type artiste.
          </p>
        </div>
        <div className="program-stats">
          <div className="program-stat">
            <span className="stat-value">{stats.jours}</span>
            <span className="stat-label">Jours</span>
          </div>
          <div className="program-stat">
            <span className="stat-value">{stats.lieux}</span>
            <span className="stat-label">Lieux</span>
          </div>
          <div className="program-stat">
            <span className="stat-value">{stats.artistes}</span>
            <span className="stat-label">Artistes</span>
          </div>
        </div>
      </section>

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
              <article
                key={item.id}
                className="program-card program-clickable"
                role="button"
                tabIndex={0}
                onClick={() => setActiveArtist(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveArtist(item);
                  }
                }}
              >
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

      {activeArtist && (
        <ArtistModal
          item={activeArtist}
          jourMap={jourMap}
          lieuMap={lieuMap}
          onClose={() => setActiveArtist(null)}
        />
      )}
    </main>
  );
}

function ArtistModal({
  item,
  jourMap,
  lieuMap,
  onClose,
}: {
  item: ProgrammationEntry;
  jourMap: Map<number, string>;
  lieuMap: Map<number, string>;
  onClose: () => void;
}) {
  const acf = item.acf ?? {};
  const artiste = readACFString(acf, "artiste") || item.title?.rendered || "Artiste";
  const image = acfImage(acf, "image") ?? acfImage(acf, "photo") ?? acfImage(acf, "visuel");
  const bio = readACFString(acf, "infos", "description", "bio");
  const style = readACFString(acf, "style", "genre");
  const horaire = readACFString(acf, "horaire", "heure");
  const jourLabels = (item.jour ?? []).map((id) => jourMap.get(id)).filter(Boolean) as string[];
  const lieuLabels = (item.lieu ?? []).map((id) => lieuMap.get(id)).filter(Boolean) as string[];

  return (
    <div className="artist-modal-backdrop" onClick={onClose}>
      <div className="artist-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="artist-modal-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
        {image && <img src={image.url} alt={image.alt || artiste} className="artist-modal-image" />}
        <h3 className="artist-modal-title">{artiste}</h3>

        <div className="artist-modal-tags">
          {jourLabels.map((label) => (
            <span key={`modal-jour-${label}`} className="tag">
              {label}
            </span>
          ))}
          {lieuLabels.map((label) => (
            <span key={`modal-lieu-${label}`} className="tag tag-muted">
              {label}
            </span>
          ))}
        </div>

        {(style || horaire) && (
          <div className="artist-modal-meta">
            {style && <p><strong>Style:</strong> {style}</p>}
            {horaire && <p><strong>Horaire:</strong> {horaire}</p>}
          </div>
        )}

        {bio ? (
          <WPContent html={bio} className="artist-modal-content" />
        ) : (
          <p className="artist-modal-empty">Aucune information complementaire.</p>
        )}
      </div>
    </div>
  );
}

type SidebarLink = { label: string; url: string };
type HardSection = { id: string; title: string; content: string };

const HARD_LINKS: Record<string, SidebarLink[]> = {
  informations: [
    { label: "Acces", url: "#acces" },
    { label: "Horaires", url: "#horaires" },
    { label: "FAQ", url: "#faq" },
  ],
  histoire: [
    { label: "Nos origines", url: "#origines" },
    { label: "Les editions", url: "#editions" },
    { label: "La scene locale", url: "#scene" },
  ],
};

const HARD_SECTIONS: Record<string, HardSection[]> = {
  informations: [
    {
      id: "acces",
      title: "Acces",
      content:
        "Le site du festival est accessible en train, a velo ou a pied. Des navettes gratuites partent de la gare toutes les 20 minutes.",
    },
    {
      id: "horaires",
      title: "Horaires",
      content:
        "Ouverture des portes a 16h. Derniere entree a 23h. Les concerts se terminent a 2h chaque nuit.",
    },
    {
      id: "faq",
      title: "FAQ",
      content:
        "Les moins de 12 ans entrent gratuitement avec un adulte. Les objets interdits sont listes a l'entree.",
    },
  ],
  histoire: [
    {
      id: "origines",
      title: "Nos origines",
      content:
        "Ne en 2014 dans une cour de quartier, le festival est devenu un rendez-vous estival pour les musiques actuelles.",
    },
    {
      id: "editions",
      title: "Les editions",
      content:
        "Chaque annee, une thematique artistique inspire la scenographie et la programmation.",
    },
    {
      id: "scene",
      title: "La scene locale",
      content:
        "Nous mettons en avant les talents regionaux avec une scene dediee et des residencies.",
    },
  ],
};

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

  if (status === "loading" && !page) {
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

  if (status === "error") return <ErrorBanner message={error ?? "Erreur de chargement"} />;
  if (!page) return <ErrorBanner message="Page introuvable" />;

  const acf = page.acf ?? {};
  const links = extractSidebarLinks(acf);
  const linksHtml = readACFString(acf, "liens_html", "links_html");
  const hardLinks = HARD_LINKS[slug] ?? [];
  const hardSections = HARD_SECTIONS[slug] ?? [];

  return (
    <main className="page-content">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="two-col">
        <aside className="side-links">
          {hardLinks.map((link) => (
            <a key={link.url} href={`#/${slug}${link.url}`} className="side-link">
              {link.label}
            </a>
          ))}
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
          {hardSections.length > 0 && (
            <div className="hard-sections">
              {hardSections.map((section) => (
                <div key={section.id} id={section.id} className="hard-section">
                  <h2>{section.title}</h2>
                  <p>{section.content}</p>
                </div>
              ))}
            </div>
          )}
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
      <section className="ticket-info">
        <div>
          <h2 className="ticket-title">Pass festival & journee</h2>
          <p className="ticket-copy">
            Acces a toutes les scenes, zones chill et experiences immersives. Places limitees.
          </p>
        </div>
        <div className="ticket-grid">
          <div className="ticket-card">
            <p className="ticket-label">Pass 3 jours</p>
            <p className="ticket-price">89 CHF</p>
          </div>
          <div className="ticket-card">
            <p className="ticket-label">Journee</p>
            <p className="ticket-price">35 CHF</p>
          </div>
          <div className="ticket-card">
            <p className="ticket-label">Etudiant</p>
            <p className="ticket-price">25 CHF</p>
          </div>
        </div>
      </section>
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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [route]);

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
