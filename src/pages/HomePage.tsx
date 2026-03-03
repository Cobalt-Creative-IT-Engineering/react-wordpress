import { useACFOptions, usePosts } from "../hooks/useWordPress";
import { acfReader } from "../components/acf";
import { HeroACF } from "../config/acf-schemas";
import type { WPPost, ACFOptions } from "../hooks/useWordPress";

// ─── Sous-composant carte actualité ────────────────────────────────────────

function NewsCard({ post }: { post: WPPost }) {
  const date = new Date(post.date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const excerpt = post.excerpt.replace(/<[^>]*>/g, "").trim().slice(0, 120);

  return (
    <article className="news-card">
      {post.featuredImage ? (
        <img
          src={post.featuredImage.url}
          alt={post.featuredImage.alt}
          className="news-card-img"
        />
      ) : (
        <div className="news-card-img news-card-img--empty" />
      )}
      <time className="news-date">{date}</time>
      <h3 className="news-card-title">{post.title}</h3>
      {excerpt && <p className="news-card-excerpt">{excerpt}…</p>}
    </article>
  );
}

// ─── Page d'accueil ────────────────────────────────────────────────────────

export function HomePage() {
  const { data: options }    = useACFOptions();
  const { posts, status }    = usePosts({ perPage: 3 });

  const hero         = acfReader(options as Record<string, unknown> | null, HeroACF);
  const title        = hero.first("title")        || "Francomanias";
  const dateLocation = hero.text("dateLocation")  || "Bulle · 27 → 30 août 2026";
  const logo         = hero.image("logo");

  const rawPartners = (options as ACFOptions | null)?.partenaires as
    | Array<{ logo?: { url: string; alt: string }; url?: string; lien?: string }>
    | undefined;

  const isLoading = status === "loading";

  return (
    <main className="festival-home">

      {/* ── 1. Héro ──────────────────────────────────────────────────── */}
      <section className="festival-hero">
        <div className="hero-grain" aria-hidden="true" />
        <div className="hero-overlay" />
        <div className="hero-content">
          {logo ? (
            <img src={logo.url} alt={logo.alt} className="hero-logo-main" />
          ) : (
            <h1 className="hero-name-display">{title}</h1>
          )}
          <p className="hero-sub">{dateLocation}</p>
          <a href="#/programmation" className="btn-primary">Line-up</a>
        </div>
      </section>

      {/* ── 2. Actualités ─────────────────────────────────────────────── */}
      <section className="home-section">
        <div className="home-section-inner">
          <h2 className="home-section-title">Actualités</h2>
          <div className="news-grid">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="news-card news-card--skeleton">
                    <div className="news-card-img news-card-img--empty" />
                    <div className="skeleton-line" style={{ width: "40%" }} />
                    <div className="skeleton-line" style={{ width: "80%" }} />
                    <div className="skeleton-line" style={{ width: "65%" }} />
                  </div>
                ))
              : posts.slice(0, 3).map((post) => (
                  <NewsCard key={post.id} post={post} />
                ))}
          </div>
        </div>
      </section>

      {/* ── 3. Line-Up banner ─────────────────────────────────────────── */}
      <section className="lineup-banner home-section">
        <a href="#/programmation" className="lineup-link">
          Line-Up
        </a>
      </section>

      {/* ── 4. Partenaires ────────────────────────────────────────────── */}
      <section className="home-section">
        <div className="home-section-inner partners-row">
          <p className="partners-label">Nos partenaires</p>
          <div className="partners-grid">
            {rawPartners && rawPartners.length > 0
              ? rawPartners.map((p, i) =>
                  p.logo ? (
                    <a
                      key={i}
                      href={p.url ?? p.lien ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={p.logo.url}
                        alt={p.logo.alt}
                        className="partner-logo"
                      />
                    </a>
                  ) : null
                )
              : null}
          </div>
        </div>
      </section>

    </main>
  );
}
