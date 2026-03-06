// ─── Page Ancienne Édition ────────────────────────────────────────────────────
// Route : #/edition/{slug}
// Charge une édition passée depuis le CPT "ancienne-edition" via REST.
import React from "react";
import { useCPT, useMediaBatch } from "../hooks/useWordPress";
import { WPContent } from "../components/ui";
import type { AncieneEditionEntry } from "../types/wordpress";

function toId(val: unknown): number | null {
  return typeof val === "number" && val > 0 ? val : null;
}

export function AncieneEditionPage({ slug }: { slug: string }) {
  const { data, status } = useCPT<AncieneEditionEntry>("ancienne-edition", {
    slug,
    perPage: 1,
  });

  const edition = data?.[0] ?? null;

  const photoId   = toId(edition?.acf?.photo);
  const progId    = toId(edition?.acf?.programmation);
  const grilleId  = toId(edition?.acf?.grille_horaire);
  const mediaIds  = [photoId, progId, grilleId].filter((id): id is number => id !== null);

  const { data: mediaMap } = useMediaBatch(mediaIds);

  if (status === "loading") {
    return (
      <main className="edition-detail">
        <div className="edition-loading" aria-busy="true" />
      </main>
    );
  }

  if (!edition) {
    return (
      <main className="edition-detail">
        <p className="edition-not-found">Édition introuvable.</p>
        <p><a href="#/festival">← Retour</a></p>
      </main>
    );
  }

  const annee      = edition.acf?.annee ?? edition.title?.rendered ?? "";
  const description = typeof edition.acf?.description === "string" ? edition.acf.description : null;

  const photo     = photoId  ? (mediaMap?.get(photoId)?.url  ?? null) : null;
  const progUrl   = progId   ? (mediaMap?.get(progId)?.url   ?? null) : null;
  const grilleUrl = grilleId ? (mediaMap?.get(grilleId)?.url ?? null) : null;

  return (
    <main className="edition-detail">
      <a href="#/festival" className="edition-back">← Retour</a>

      <h1 className="edition-year">{annee}</h1>

      {photo && (
        <img src={photo} alt={`Affiche Francomanias ${annee}`} className="edition-poster" />
      )}

      {description && (
        <WPContent html={description} className="edition-description" />
      )}

      {(progUrl || grilleUrl) && (
        <div className="edition-links">
          {progUrl && (
            <a href={progUrl} target="_blank" rel="noreferrer" className="edition-link">
              → PROGRAMMATION
            </a>
          )}
          {grilleUrl && (
            <a href={grilleUrl} target="_blank" rel="noreferrer" className="edition-link">
              → GRILLE HORAIRE
            </a>
          )}
        </div>
      )}
    </main>
  );
}
