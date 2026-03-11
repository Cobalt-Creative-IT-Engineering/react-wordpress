import { acfReader } from "../components/acf";
import { WPContent, Sticker } from "../components/ui";
import { ArtistACF } from "../config/acf-schemas";
import type { ProgrammationEntry } from "../types/wordpress";
import sticker09 from "../assets/images/stickers/Franco2026_Sticker_09.png";

/** ACF date_picker retourne "YYYYMMDD" → on affiche "DD.MM" */
function formatAcfDate(raw: string | null): string {
  if (!raw) return "";
  const d = raw.replace(/\D/g, "");
  if (d.length === 8) return `${d.slice(6)}.${d.slice(4, 6)}`;
  return raw;
}

interface ArtistModalProps {
  item:     ProgrammationEntry;
  isOpen?:  boolean;
  jourMap:  Map<number, string>;
  lieuMap:  Map<number, string>;
  mediaMap: Map<number, { url: string; alt: string }>;
  onClose:  () => void;
}

export default function ArtistModal({ item, jourMap, lieuMap, mediaMap, onClose }: ArtistModalProps) {
  const acf   = acfReader(item.acf ?? {}, ArtistACF, mediaMap);
  const nom   = acf.text("nom") || item.title?.rendered || "Artiste";
  const image = acf.image("photo");
  const bio   = acf.text("infos");  // champ wysiwyg

  // date_picker → "28.08"
  const dateStr = formatAcfDate(acf.text("date"));

  // Taxonomies
  const jourLabels = (item.jour ?? []).map((id) => jourMap.get(id)).filter(Boolean) as string[];
  const lieuLabels = (item.lieu ?? []).map((id) => lieuMap.get(id)).filter(Boolean) as string[];
  const lieuStr    = lieuLabels.join(", ");

  // Repeater liens → [{ nom_du_lien, lien }]
  const liens = Array.isArray(item.acf?.liens)
    ? (item.acf.liens as { nom_du_lien?: string; lien?: string }[])
    : [];

  // URL billetterie : seulement si le champ est rempli
  const billetterieUrl = (item.acf?.lien_vers_la_billetterie as string | undefined) || null;

  return (
    <div className="artist-modal-backdrop" onClick={onClose}>
      <div
        className="artist-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="artist-modal-inner">
          <Sticker src={sticker09} size={90} rotate={-12} style={{ bottom: 8, left: 8, zIndex: 10 }} />

          {/* ── Colonne photo ──────────────────────────────────────────── */}
          <div className="artist-modal-photo-col">
            {image
              ? <img src={image.url} alt={image.alt || nom} className="artist-modal-photo" />
              : <div className="artist-modal-photo artist-modal-photo--empty" />
            }
          </div>

          {/* ── Colonne contenu ────────────────────────────────────────── */}
          <div className="artist-modal-body">

            {/* Header fixe : nom + date/lieu + bouton fermeture */}
            <div className="artist-modal-header">
              <div className="artist-modal-meta">
                <h2 className="artist-modal-name">{nom}</h2>
                {(dateStr || lieuStr) && (
                  <div className="artist-modal-when">
                    {dateStr && <span>{dateStr}</span>} · {lieuStr && <span>{lieuStr}</span>}
                  </div>
                )}
              </div>
              <button className="artist-modal-close" onClick={onClose} aria-label="Fermer">×</button>
            </div>

            {/* Zone scrollable : bio + liens */}
            <div className="artist-modal-scroll">
              {bio
                ? <WPContent html={bio} className="artist-modal-bio" />
                : <p className="artist-modal-bio artist-modal-bio--empty">Aucune information complémentaire.</p>
              }
              {liens.length > 0 && (
                <div className="artist-modal-links">
                  {liens.map((l, i) => l.lien ? (
                    <a key={i} href={l.lien} target="_blank" rel="noreferrer" className="artist-modal-link">
                      → {l.nom_du_lien || l.lien}
                    </a>
                  ) : null)}
                </div>
              )}
            </div>

            {/* Footer fixe : billetterie en bas à droite */}
            {billetterieUrl && (
              <div className="artist-modal-footer">
                <a href={billetterieUrl} className="artist-modal-cta">Billetterie</a>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
