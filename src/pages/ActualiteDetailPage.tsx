// ─── Page Détail Actualité ────────────────────────────────────────────────────
// Route : #/actualite/{slug}
import { useCPT, useMediaBatch } from "../hooks/useWordPress";
import { WPContent } from "../components/ui";
import type { ActualiteEntry } from "../types/wordpress";

export function ActualiteDetailPage({ slug }: { slug: string }) {
  const { data, status } = useCPT<ActualiteEntry>("actualite", {
    slug,
    perPage: 1,
  });

  const entry = data?.[0] ?? null;

  const photoId = typeof entry?.acf?.photo === "number" && entry.acf.photo > 0
    ? entry.acf.photo
    : null;
  const { data: mediaMap } = useMediaBatch(photoId ? [photoId] : []);

  if (status === "loading") {
    return (
      <main className="edition-detail">
        <div className="edition-loading" aria-busy="true" />
      </main>
    );
  }

  if (!entry) {
    return (
      <main className="edition-detail">
        <p>Actualité introuvable.</p>
        <p><a href="#/">← Retour</a></p>
      </main>
    );
  }

  const title = entry.title?.rendered ?? "";
  const date = entry.date
    ? new Date(entry.date).toLocaleDateString("fr-FR", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "";
  const contenu = entry.acf?.contenu ?? null;

  const photoUrl = photoId
    ? (mediaMap?.get(photoId)?.url ?? null)
    : (typeof entry.acf?.photo === "object" && entry.acf?.photo
        ? (entry.acf.photo as { url: string }).url
        : null);

  return (
    <main className="edition-detail actu-detail">
      <a href="#/" className="edition-back">← Retour</a>

      {date && <time className="actu-detail-date">{date}</time>}

      <h1 className="actu-detail-title">{title}</h1>

      {photoUrl && (
        <img src={photoUrl} alt={title} className="edition-poster" />
      )}

      {contenu && (
        <WPContent html={contenu} className="edition-description actu-detail-content" />
      )}
    </main>
  );
}
