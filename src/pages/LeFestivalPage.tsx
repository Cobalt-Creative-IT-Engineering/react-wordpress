// ─── Page Le Festival — version ACF/GraphQL ───────────────────────────────────
// Charge le contenu depuis WPGraphQL (options page leFestival).
// Partenaires via REST /wp/v2 (CPT). Sections vides si pas de contenu WP.
import React from "react";
import { useGraphQLOptions, useCPT, useMediaBatch, useTaxonomyTerms } from "../hooks/useWordPress";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { WPContent, Sticker } from "../components/ui";
import type { AncieneEditionEntry, PartenaireEntry } from "../types/wordpress";
import sticker09 from "../assets/images/stickers/Franco2026_Sticker_09.png";
import sticker01 from "../assets/images/stickers/Franco2026_Sticker_01.png";
import sticker08 from "../assets/images/stickers/Franco2026_Sticker_08.png";

type GQLImg       = { sourceUrl: string; altText?: string };
type GQLEdge      = { node: GQLImg } | null;
type EquipeMembre = { nom: string; role?: string; photo?: GQLEdge };
type ContactBloc  = { titre: string; email?: string; tel?: string; adresse?: string };
type LienItem     = { label: string; url: string };

const NAV = [
  { label: "Présentation",              id: "presentation" },
  { label: "L'équipe des Francomanias", id: "equipe" },
  { label: "Archives",                  id: "archives" },
  { label: "Contact",                   id: "contact" },
  { label: "Presse",                    id: "presse" },
  { label: "Photographes",              id: "photographes" },
  { label: "Partenaires",               id: "partenaires" },
] as const;

function scrollToSection(id: string) {
  return (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
}

function cptImgUrl(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === "object" && "url" in (val as object)) return (val as { url: string }).url;
  return null;
}

function str(val: unknown): string | null {
  return typeof val === "string" && val.length > 0 ? val : null;
}

function arr<T>(val: unknown): T[] | null {
  return Array.isArray(val) && val.length > 0 ? (val as T[]) : null;
}

export function LeFestivalPage() {
  const { data } = useGraphQLOptions();
  const fest = data?.leFestival;
  const activeId = useScrollSpy(NAV.map((i) => i.id));

  const pres             = fest?.leFestivalPresentation;
  const presentationHtml = str(pres?.presentationContenu);
  const missionHtml      = str(pres?.missionValeurs);
  const presentationImg  = pres?.presentationImage ?? null;

  const equipeItems       = arr<EquipeMembre>(fest?.leFestivalEquipe?.equipe);
  const contactBlocs      = arr<ContactBloc>(fest?.leFestivalContact?.contactBlocs);
  const presseLiens       = arr<LienItem>(fest?.leFestivalPresse?.presseLiens);
  const photographesLiens = arr<LienItem>(fest?.leFestivalPresse?.photographesLiens);

  const { data: archives }       = useCPT<AncieneEditionEntry>("ancienne-edition", { perPage: 30, orderby: "title", order: "desc" });
  const { data: partenaires }    = useCPT<PartenaireEntry>("partenaire", { perPage: 50 });
  const { data: partnerCats }    = useTaxonomyTerms("categorie");

  // Résolution des IDs d'images (REST retourne des entiers pour les champs image/file)
  const archivePhotoIds = (archives ?? [])
    .map((e) => e.acf?.photo)
    .filter((v): v is number => typeof v === "number" && v > 0);
  const partnerLogoIds = (partenaires ?? [])
    .map((p) => p.acf?.logo)
    .filter((v): v is number => typeof v === "number" && v > 0);
  const allMediaIds = [...new Set([...archivePhotoIds, ...partnerLogoIds])];
  const { data: mediaMap } = useMediaBatch(allMediaIds);

  return (
    <main className="page-content">
      <div className="two-col">

        <aside className="side-links">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={scrollToSection(item.id)}
              className={`side-link${activeId === item.id ? " side-link--active" : ""}`}
            >
              {item.label}
            </a>
          ))}
          <div className="side-stickers">
            <Sticker src={sticker09} size={90} rotate={-10} style={{ top: 0, left: 0 }} />
            <Sticker src={sticker01} size={90} rotate={14} style={{ top: 10, right: 0 }} />
          </div>
        </aside>

        <section className="content-column">

          {/* ── Présentation ────────────────────────────────────────────── */}
          <div id="presentation" className="ip-section">
            <h2>Présentation</h2>
            {presentationImg?.node?.sourceUrl && (
              <img
                src={presentationImg.node.sourceUrl}
                alt={presentationImg.node.altText ?? "Francomanias"}
                className="ip-presentation-img"
              />
            )}
            {presentationHtml && <WPContent html={presentationHtml} className="prose-custom" />}
            {missionHtml && <WPContent html={missionHtml} className="prose-custom" />}
          </div>

          {/* ── Équipe ──────────────────────────────────────────────────── */}
          <div id="equipe" className="ip-section">
            <h2>L'équipe des Francomanias</h2>
            {equipeItems && (
              <div className="ip-team-grid">
                {equipeItems.map((m, i) => {
                  const photoUrl = m.photo?.node?.sourceUrl ?? null;
                  return (
                    <div key={i} className="ip-team-member">
                      {photoUrl && (
                        <img src={photoUrl} alt={m.photo?.node?.altText || m.nom} className="ip-team-photo" />
                      )}
                      <div className="ip-team-info">
                        <strong>{m.nom}</strong>
                        {m.role && <span>{m.role}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Archives ────────────────────────────────────────────────── */}
          <div id="archives" className="ip-section">
            <h2>Archives</h2>
            {archives && archives.length > 0 && (
              <div className="ip-archives-grid">
                {archives.map((edition) => {
                  const photoId  = typeof edition.acf?.photo === "number" ? edition.acf.photo : null;
                  const photoUrl = photoId ? (mediaMap?.get(photoId)?.url ?? null) : null;
                  const annee    = edition.acf?.annee ?? edition.title?.rendered ?? "";
                  return (
                    <a key={edition.id} href={`/edition/${edition.slug}`} className="ip-archive-card">
                      {photoUrl ? (
                        <img src={photoUrl} alt={annee} className="ip-archive-img" />
                      ) : (
                        <div className="ip-archive-img" aria-hidden="true" />
                      )}
                      <span className="ip-archive-year">{annee}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Contact ─────────────────────────────────────────────────── */}
          <div id="contact" className="ip-section">
            <h2>Contact</h2>
            {contactBlocs && (
              <div className="ip-contact-grid">
                {contactBlocs.map((bloc, i) => (
                  <div key={i}>
                    <h3>{bloc.titre}</h3>
                    {bloc.adresse && <div className="ip-contact-address" dangerouslySetInnerHTML={{ __html: bloc.adresse }} />}
                    {bloc.email && <div><a href={`mailto:${bloc.email}`}>{bloc.email}</a></div>}
                    {bloc.tel && <div><a href={`tel:${bloc.tel.replace(/\s/g, "")}`}>{bloc.tel}</a></div>}
                  </div>
                ))}
              </div>
            )}
            <Sticker src={sticker08} size={120} rotate={-8} style={{ bottom: 16, right: 16 }} />
          </div>

          {/* ── Presse ──────────────────────────────────────────────────── */}
          <div id="presse" className="ip-section">
            <h2>Presse</h2>
            {presseLiens && (
              <ul>
                {presseLiens.map((lien, i) => (
                  <li key={i}>
                    <a href={lien.url} target="_blank" rel="noreferrer" className="ip-link-arrow">
                      → {lien.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── Photographes ────────────────────────────────────────────── */}
          <div id="photographes" className="ip-section">
            <h2>Photographes</h2>
            {photographesLiens && (
              <ul>
                {photographesLiens.map((lien, i) => (
                  <li key={i}>
                    <a href={lien.url} target="_blank" rel="noreferrer" className="ip-link-arrow">
                      → {lien.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── Partenaires ─────────────────────────────────────────────── */}
          <div id="partenaires" className="ip-section">
            <h2>Partenaires</h2>
            {partenaires && partenaires.length > 0 && (() => {
              const cats = partnerCats && partnerCats.length > 0 ? partnerCats : null;
              const renderPartner = (p: PartenaireEntry) => {
                const logoId  = typeof p.acf?.logo === "number" ? p.acf.logo : null;
                const logoUrl = logoId
                  ? (mediaMap?.get(logoId)?.url ?? null)
                  : cptImgUrl(p.acf?.logo);
                const titre = p.title?.rendered ?? "";
                const href  = p.acf?.lien || null;
                const isSvg = logoUrl?.toLowerCase().endsWith(".svg") ?? false;
                const inner = logoUrl
                  ? <img src={logoUrl} alt={titre} className={`partner-logo${isSvg ? " partner-logo--svg" : ""}`} />
                  : <span className="partner-logo-name">{titre}</span>;
                return href ? (
                  <a key={p.id} href={href} target="_blank" rel="noreferrer" className="partner-logo-link">{inner}</a>
                ) : (
                  <div key={p.id} className="partner-logo-link">{inner}</div>
                );
              };

              if (cats) {
                return cats.map((cat) => {
                  const catPartners = partenaires.filter((p) =>
                    (p.categorie ?? []).includes(cat.id)
                  );
                  if (catPartners.length === 0) return null;
                  return (
                    <div key={cat.id} className="ip-partners-category">
                      <h3 className="ip-partners-cat-title">{cat.name}</h3>
                      <div className="ip-partners-grid-3">
                        {catPartners.map(renderPartner)}
                      </div>
                    </div>
                  );
                });
              }

              return (
                <div className="ip-partners-grid-3">
                  {partenaires.map(renderPartner)}
                </div>
              );
            })()}
          </div>

        </section>
      </div>
    </main>
  );
}
