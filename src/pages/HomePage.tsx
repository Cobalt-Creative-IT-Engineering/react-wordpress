import React from "react";
import { useCPT, useMediaBatch, prefetchCPTItems } from "../hooks/useWordPress";
import { Sticker } from "../components/ui";
import type { ActualiteEntry, PartenaireEntry, ProgrammationEntry } from "../types/wordpress";
import logoCompact from "../assets/logo/francomanias-compact-2026.svg";
import heroGif from "../assets/images/textures/motions/Francomanias_Animation_02.gif";
import heroPoster from "../assets/images/textures/statics/Franco_Gradient_05.jpg";
import sticker09 from "../assets/images/stickers/Franco2026_Sticker_09.png";
import sticker10 from "../assets/images/stickers/Franco2026_Sticker_10.png";

// ─── Carte actualité ───────────────────────────────────────────────────────

function ActualiteCard({
  entry,
  mediaMap,
}: {
  entry: ActualiteEntry;
  mediaMap?: Map<number, { url: string; alt: string }>;
}) {
  const date = entry.date
    ? new Date(entry.date).toLocaleDateString("fr-FR", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "";
  const title    = entry.title?.rendered ?? "";
  const photoId  = typeof entry.acf?.photo === "number" ? entry.acf.photo : null;
  const photoUrl = photoId
    ? (mediaMap?.get(photoId)?.url ?? null)
    : (typeof entry.acf?.photo === "object" && entry.acf.photo
        ? (entry.acf.photo as { url: string }).url
        : null);
  const excerpt  = entry.acf?.contenu
    ? entry.acf.contenu.replace(/<[^>]*>/g, "").trim().slice(0, 120)
    : "";

  return (
    <a href={`/actualite/${entry.slug}`} className="news-card news-card--link">
      {photoUrl ? (
        <img src={photoUrl} alt={title} className="news-card-img" />
      ) : (
        <div className="news-card-img news-card-img--empty" />
      )}
      <time className="news-date">{date}</time>
      <h3 className="news-card-title">{title}</h3>
      {excerpt && <p className="news-card-excerpt">{excerpt}…</p>}
    </a>
  );
}

// ─── Page d'accueil ────────────────────────────────────────────────────────

export function HomePage() {
  const { data: actualites, status } = useCPT<ActualiteEntry>("actualite", {
    perPage: 12,
    orderby: "date",
    order: "desc",
  });
  const { data: partenaires } = useCPT<PartenaireEntry>("partenaire", { perPage: 50 });
  const { data: artistes }    = useCPT<ProgrammationEntry>("artiste", { perPage: 100, orderby: "date", order: "asc" });

  // Résolution batch de tous les IDs média (photos actualités + logos partenaires)
  const actualitePhotoIds = (actualites ?? [])
    .map((e) => e.acf?.photo)
    .filter((v): v is number => typeof v === "number" && v > 0);
  const partenaireLogoIds = (partenaires ?? [])
    .map((p) => p.acf?.logo)
    .filter((v): v is number => typeof v === "number" && v > 0);
  const { data: mediaMap } = useMediaBatch(
    [...new Set([...actualitePhotoIds, ...partenaireLogoIds])]
  );

  // ── Carousel ──────────────────────────────────────────────────────────────
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft,  setCanScrollLeft]  = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const updateArrows = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  React.useEffect(() => { updateArrows(); }, [actualites, updateArrows]);

  // Préchargement des pages détail dès que la liste est disponible
  React.useEffect(() => {
    if (!actualites?.length) return;
    const items = actualites.map((e) => ({
      slug: e.slug,
      photoIds: typeof e.acf?.photo === "number" && e.acf.photo > 0 ? [e.acf.photo] : [],
    }));
    void prefetchCPTItems("actualite", items);
  }, [actualites]);

  function scrollCarousel(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const gap  = parseFloat(getComputedStyle(el).gap) || 0;
    const step = card ? card.offsetWidth + gap : el.clientWidth;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  const isLoading = status === "loading";

  return (
    <main className="festival-home">

      {/* ── 1. Héro ──────────────────────────────────────────────────── */}
      <section className="festival-hero">
        <img className="hero-video-bg" src={heroGif} alt="" aria-hidden="true" style={{ backgroundImage: `url(${heroPoster})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="hero-overlay" />
        <Sticker src={sticker09} size={160} rotate={-15} className="sticker-fg" style={{ position: "absolute", top: "12%", left: "4%" }} />
        <Sticker src={sticker10} size={140} rotate={18} className="sticker-fg" style={{ position: "absolute", bottom: "14%", right: "5%" }} />
        <div className="hero-content">
          <div
            className="hero-logo-compact"
            style={{
              WebkitMaskImage: `url(${logoCompact})`,
              maskImage: `url(${logoCompact})`,
            }}
            aria-label="Francomanias"
          />
        </div>
        <button
          className="hero-scroll-arrow"
          aria-label="Défiler vers le bas"
          onClick={() => {
            document.querySelector<HTMLElement>(".home-section")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          ↓
        </button>
      </section>

      {/* ── 2. Actualités — fond blanc, titre centré, carousel ────────── */}
      <section className="home-section home-section--white" style={{ position: "relative" }}>
        <Sticker src={sticker09} size={130} rotate={12} style={{ bottom: 24, right: 24 }} />
        <div className="home-section-inner">
          <h2 className="home-section-title home-section-title--center">Actualités</h2>
        </div>
        <div className="news-carousel-wrapper">
          {canScrollLeft && (
            <button className="news-carousel-btn news-carousel-btn--left" onClick={() => scrollCarousel(-1)} aria-label="Précédent">←</button>
          )}
          <div className="news-carousel-track" ref={trackRef} onScroll={updateArrows}>
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="news-card news-card--skeleton">
                    <div className="news-card-img news-card-img--empty" />
                    <div className="skeleton-line" style={{ width: "40%" }} />
                    <div className="skeleton-line" style={{ width: "80%" }} />
                    <div className="skeleton-line" style={{ width: "65%" }} />
                  </div>
                ))
              : (actualites ?? []).map((entry) => (
                  <ActualiteCard key={entry.id} entry={entry} mediaMap={mediaMap ?? undefined} />
                ))}
          </div>
          {canScrollRight && (
            <button className="news-carousel-btn news-carousel-btn--right" onClick={() => scrollCarousel(1)} aria-label="Suivant">→</button>
          )}
        </div>
      </section>

      {/* ── 3. Line-Up — fond color-2 ─────────────────────────────────── */}
      <section className="lineup-banner home-section">
        <div className="lineup-inner">
          <a href="/programmation" className="lineup-link">Line-Up</a>
          {artistes && artistes.length > 0 && (
            <p className="lineup-names">
              {artistes.map((a, i) => {
                const nom = (a.acf?.nom as string | undefined) || a.title?.rendered || "";
                return (
                  <React.Fragment key={a.id}>
                    <a href={`/programmation/${a.slug}`} className="lineup-name">{nom}</a>
                    {i < artistes.length - 1 && <span className="lineup-sep" aria-hidden="true"> · </span>}
                  </React.Fragment>
                );
              })}
            </p>
          )}
        </div>
      </section>

      {/* ── 4. Partenaires — fond blanc ────────────────────────────────── */}
      <section className="home-section home-section--white">
        <div className="home-section-inner">
          <div className="partners-3col">
            <p className="partners-label">Nos partenaires</p>
            <div className="partners-logos-area">
              {(partenaires ?? []).map((p) => {
                const logoId  = typeof p.acf?.logo === "number" ? p.acf.logo : null;
                const logoUrl = logoId
                  ? (mediaMap?.get(logoId)?.url ?? null)
                  : (typeof p.acf?.logo === "object" && p.acf.logo
                      ? (p.acf.logo as { url: string }).url
                      : null);
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
              })}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
