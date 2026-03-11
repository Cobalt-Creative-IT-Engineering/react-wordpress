import React, { useMemo, useRef, useState } from "react";
import { useCPT, useTaxonomyTerms, useMediaBatch, useGraphQLSiteOptions } from "../hooks/useWordPress";
import { acfReader } from "../components/acf";
import { ErrorBanner, Skeleton, Sticker } from "../components/ui";
import { ArtistACF } from "../config/acf-schemas";
import type { ProgrammationEntry } from "../types/wordpress";
import sticker04 from "../assets/images/stickers/Franco2026_Sticker_04.png";

const LazyArtistModal = React.lazy(() => import("./ArtistModal"));

/** ACF date_picker retourne "YYYYMMDD" → on affiche "DD.MM" */
function formatAcfDate(raw: string | null): string {
  if (!raw) return "";
  const d = raw.replace(/\D/g, "");
  if (d.length === 8) return `${d.slice(6)}.${d.slice(4, 6)}`;
  return raw;
}

type MediaMap = Map<number, { url: string; alt: string }>;

const FALLBACK_GRILLE = "#grille-horaire";

export function ProgrammationPage({ initialSlug }: { initialSlug?: string } = {}) {
  const { data: gqlData } = useGraphQLSiteOptions();
  const grilleUrl = gqlData?.programmation?.programmationOptions?.grilleHoraireUrl || FALLBACK_GRILLE;

  const { status, data, error } = useCPT<ProgrammationEntry>("artiste", {
    perPage: 100,
    orderby: "date",
    order:   "asc",
  });
  const { data: jourTerms, status: jourStatus } = useTaxonomyTerms("jour");
  const { data: lieuTerms, status: lieuStatus } = useTaxonomyTerms("lieu");

  const [selectedJour, setSelectedJour] = useState<number | null>(null);
  const [selectedLieu, setSelectedLieu] = useState<number | null>(null);
  const toutLieuRef = useRef<HTMLButtonElement>(null);
  const toutJourRef = useRef<HTMLButtonElement>(null);
  const [activeArtist, setActiveArtist] = useState<ProgrammationEntry | null>(null);

  // Ouvre automatiquement le modal si un slug initial est fourni (navigation depuis l'accueil)
  React.useEffect(() => {
    if (!initialSlug || !data?.length) return;
    const found = data.find((i) => i.slug === initialSlug);
    if (found) setActiveArtist(found);
  }, [initialSlug, data]);

  const jourMap = useMemo(() => new Map((jourTerms ?? []).map((t) => [t.id, t.name])), [jourTerms]);
  const lieuMap = useMemo(() => new Map((lieuTerms ?? []).map((t) => [t.id, t.name])), [lieuTerms]);

  const items = data ?? [];

  // Collecte les IDs d'images uniques pour les résoudre en batch
  const photoIds = useMemo(
    () => [...new Set(
      items
        .map((i) => i.acf?.photo)
        .filter((p): p is number => typeof p === "number" && p > 0)
    )],
    [items]
  );
  const { data: mediaData } = useMediaBatch(photoIds);
  const mediaMap: MediaMap = mediaData ?? new Map();

  // Précharge toutes les images artistes dès que les URLs sont connues
  React.useEffect(() => {
    for (const { url } of mediaMap.values()) {
      const img = new window.Image();
      img.src = url;
    }
  }, [mediaMap]);

  const visibleItems = items.filter((item) => {
    const matchJour = selectedJour ? (item.jour ?? []).includes(selectedJour) : true;
    const matchLieu = selectedLieu ? (item.lieu ?? []).includes(selectedLieu) : true;
    return matchJour && matchLieu;
  });
  const noneVisible = items.length > 0 && visibleItems.length === 0;

  return (
    <main className="page-content">

      <div className="program-header">
        <h1 className="program-title">Programmation</h1>
        <a href={grilleUrl} className="program-grille-link">+ Grille horaire</a>
      </div>

      {/* Filtres */}
      <div className="program-filters">
        {/* Lieux */}
        <div className="filter-row">
          {lieuStatus === "loading"
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-3 w-24" />)
            : <>
                <button
                  ref={toutLieuRef}
                  className={`filter-chip${!selectedLieu ? " active" : ""}`}
                  onClick={(e) => { setSelectedLieu(null); e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); }}
                >
                  Tout
                </button>
                {(lieuTerms ?? []).map((term) => (
                  <button
                    key={term.id}
                    className={`filter-chip${selectedLieu === term.id ? " active" : ""}`}
                    onClick={(e) => {
                      const deselect = selectedLieu === term.id;
                      setSelectedLieu(deselect ? null : term.id);
                      if (deselect) toutLieuRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                      else e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                    }}
                  >
                    {term.name}
                  </button>
                ))}
              </>
          }
        </div>
        {/* Jours */}
        <div className="filter-row">
          <button
            ref={toutJourRef}
            className={`filter-chip${!selectedJour ? " active" : ""}`}
            onClick={(e) => { setSelectedJour(null); e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); }}
          >
            Tout
          </button>
          {jourStatus === "loading"
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-3 w-20" />)
            : (jourTerms ?? []).map((term) => (
                <button
                  key={term.id}
                  className={`filter-chip${selectedJour === term.id ? " active" : ""}`}
                  onClick={(e) => {
                    const deselect = selectedJour === term.id;
                    setSelectedJour(deselect ? null : term.id);
                    if (deselect) toutJourRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                    else e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                  }}
                >
                  {term.name}
                </button>
              ))
          }
        </div>
      </div>

      {/* Grille */}
      {status === "loading" && items.length === 0 ? (
        <div className="program-grid">
          <div className="program-col">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="program-card program-card-photo--empty" style={{ opacity: 0.4 }} />
            ))}
          </div>
          <div className="program-col program-col--right">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="program-card program-card-photo--empty" style={{ opacity: 0.4 }} />
            ))}
          </div>
        </div>
      ) : status === "error" ? (
        <ErrorBanner message={error ?? "Erreur de chargement"} />
      ) : (
        <>
          {noneVisible && <ErrorBanner message="Aucun artiste n'est disponible pour ces filtres." />}
          <div className="program-grid-container">
            <Sticker src={sticker04} size={110} rotate={8} style={{ top: -40, right: -10 }} />
            <div className="program-grid">
              <div className="program-col">
                {visibleItems.filter((item) => items.indexOf(item) % 2 === 0).map((item) => (
                  <ArtistCard
                    key={item.id}
                    item={item}
                    mediaMap={mediaMap}
                    onClick={() => setActiveArtist(item)}
                  />
                ))}
              </div>
              <div className="program-col program-col--right">
                {visibleItems.filter((item) => items.indexOf(item) % 2 === 1).map((item) => (
                  <ArtistCard
                    key={item.id}
                    item={item}
                    mediaMap={mediaMap}
                    onClick={() => setActiveArtist(item)}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeArtist && (
        <React.Suspense fallback={null}>
          <LazyArtistModal
            key={activeArtist.id}
            item={activeArtist}
            isOpen
            jourMap={jourMap}
            lieuMap={lieuMap}
            mediaMap={mediaMap}
            onClose={() => setActiveArtist(null)}
          />
        </React.Suspense>
      )}
    </main>
  );
}

// ─── Carte artiste ────────────────────────────────────────────────────────────

function ArtistCard({
  item,
  mediaMap,
  onClick,
}: {
  item:     ProgrammationEntry;
  mediaMap: MediaMap;
  onClick:  () => void;
}) {
  const acf     = acfReader(item.acf ?? {}, ArtistACF, mediaMap);
  const nom     = acf.text("nom") || item.title?.rendered || "Artiste";
  const image   = acf.image("photo");
  const rawDate = acf.text("date");
  const dateStr = formatAcfDate(rawDate);

  return (
    <article
      className="program-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); }
      }}
    >
      {image
        ? <img src={image.url} alt={nom} className="program-card-photo" />
        : <div className="program-card-photo program-card-photo--empty" />
      }
      <div className="program-card-overlay" />
      <span className="program-card-name">{nom}</span>
      {dateStr && <span className="program-card-date">{dateStr}</span>}
    </article>
  );
}
