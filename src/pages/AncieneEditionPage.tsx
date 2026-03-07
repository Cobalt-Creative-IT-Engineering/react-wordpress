// ─── Page Ancienne Édition ────────────────────────────────────────────────────
// Route : #/edition/{slug}
// Charge une édition passée depuis le CPT "ancienne-edition" via REST.
import { useEffect } from "react";
import { useCPT, useMediaBatch } from "../hooks/useWordPress";
import { WPContent, Sticker } from "../components/ui";
import { setPageMeta } from "../lib/meta";
import type { AncieneEditionEntry } from "../types/wordpress";
import sticker12 from "../assets/images/stickers/Franco2026_Sticker_12.png";
import sticker02 from "../assets/images/stickers/Franco2026_Sticker_02.png";

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

  const annee       = edition?.acf?.annee ?? edition?.title?.rendered ?? "";
  const description = typeof edition?.acf?.description === "string" ? edition.acf.description : null;
  const photo       = photoId ? (mediaMap?.get(photoId)?.url ?? null) : null;
  const descText    = description ? description.replace(/<[^>]*>/g, "").trim().slice(0, 160) : undefined;
  const progUrl     = progId   ? (mediaMap?.get(progId)?.url   ?? null) : null;
  const grilleUrl   = grilleId ? (mediaMap?.get(grilleId)?.url ?? null) : null;

  useEffect(() => {
    if (!edition) return;
    setPageMeta({ title: `Francomanias ${annee}`, description: descText, image: photo ?? undefined, type: "article" });
  }, [edition, annee, descText, photo]);

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
        <p><a href="/festival">← Retour</a></p>
      </main>
    );
  }

  return (
    <main className="edition-detail">
      <Sticker src={sticker12} size={110} rotate={-12} style={{ top: 16, left: 16 }} />
      <a href="/festival" className="edition-back">← Retour</a>

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
      <Sticker src={sticker02} size={110} rotate={10} style={{ bottom: 16, right: 16 }} />
    </main>
  );
}
