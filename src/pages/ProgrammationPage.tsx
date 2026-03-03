import React, { useMemo, useState } from "react";
import { useCPT, useTaxonomyTerms, useMediaBatch } from "../hooks/useWordPress";
import { acfReader } from "../components/acf";
import { ErrorBanner, Skeleton } from "../components/ui";
import { ArtistACF } from "../config/acf-schemas";
import type { ProgrammationEntry } from "../types/wordpress";

const LazyArtistModal = React.lazy(() => import("./ArtistModal"));

/** ACF date_picker retourne "YYYYMMDD" → on affiche "DD.MM" */
function formatAcfDate(raw: string | null): string {
  if (!raw) return "";
  const d = raw.replace(/\D/g, "");
  if (d.length === 8) return `${d.slice(6)}.${d.slice(4, 6)}`;
  return raw;
}

type MediaMap = Map<number, { url: string; alt: string }>;

export function ProgrammationPage() {
  const { status, data, error } = useCPT<ProgrammationEntry>("artiste", {
    perPage: 100,
    orderby: "date",
    order:   "asc",
  });
  const { data: jourTerms, status: jourStatus } = useTaxonomyTerms("jour");
  const { data: lieuTerms, status: lieuStatus } = useTaxonomyTerms("lieu");

  const [selectedJour, setSelectedJour] = useState<number | null>(null);
  const [selectedLieu, setSelectedLieu] = useState<number | null>(null);
  const [activeArtist, setActiveArtist] = useState<ProgrammationEntry | null>(null);

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

  // Calcul de visibilité : toutes les cartes restent dans le DOM,
  // on les masque avec display:none pour éviter de recharger les images.
  const isVisible = (item: ProgrammationEntry) => {
    const matchJour = selectedJour ? (item.jour ?? []).includes(selectedJour) : true;
    const matchLieu = selectedLieu ? (item.lieu ?? []).includes(selectedLieu) : true;
    return matchJour && matchLieu;
  };
  const noneVisible = items.length > 0 && !items.some(isVisible);

  return (
    <main className="page-content">

      <div className="program-header">
        <h1 className="program-title">Programmation</h1>
        <a href="#grille-horaire" className="program-grille-link">+ Grille horaire</a>
      </div>

      {/* Filtres */}
      <div className="program-filters">
        {/* Lieux */}
        <div className="filter-row">
          {lieuStatus === "loading"
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-3 w-24" />)
            : (lieuTerms ?? []).map((term) => (
                <button
                  key={term.id}
                  className={`filter-chip${selectedLieu === term.id ? " active" : ""}`}
                  onClick={() => setSelectedLieu(selectedLieu === term.id ? null : term.id)}
                >
                  {term.name}
                </button>
              ))
          }
        </div>
        {/* Jours */}
        <div className="filter-row">
          {jourStatus === "loading"
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-3 w-20" />)
            : (jourTerms ?? []).map((term) => (
                <button
                  key={term.id}
                  className={`filter-chip${selectedJour === term.id ? " active" : ""}`}
                  onClick={() => setSelectedJour(selectedJour === term.id ? null : term.id)}
                >
                  {term.name}
                </button>
              ))
          }
          <button
            className={`filter-chip${!selectedJour ? " active" : ""}`}
            onClick={() => setSelectedJour(null)}
          >
            Tout
          </button>
        </div>
      </div>

      {/* Grille */}
      {status === "loading" && items.length === 0 ? (
        <div className="program-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="program-card program-card-photo--empty" style={{ opacity: 0.4 }} />
          ))}
        </div>
      ) : status === "error" ? (
        <ErrorBanner message={error ?? "Erreur de chargement"} />
      ) : (
        <>
          {noneVisible && <ErrorBanner message="Aucun artiste pour ces filtres." />}
          <div className="program-grid">
            {items.map((item) => (
              <ArtistCard
                key={item.id}
                item={item}
                mediaMap={mediaMap}
                visible={isVisible(item)}
                onClick={() => setActiveArtist(item)}
              />
            ))}
          </div>
        </>
      )}

      {activeArtist && (
        <React.Suspense fallback={null}>
          <LazyArtistModal
            item={activeArtist}
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
  visible,
  onClick,
}: {
  item:     ProgrammationEntry;
  mediaMap: MediaMap;
  visible:  boolean;
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
      tabIndex={visible ? 0 : -1}
      aria-hidden={visible ? undefined : true}
      style={visible ? undefined : { display: "none" }}
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
