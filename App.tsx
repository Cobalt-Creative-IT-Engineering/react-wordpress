import React, { useState } from "react";
import { usePosts, usePost, usePage, useACFOptions } from "./hooks/useWordPress";
import { ACFRenderer, acfText, acfImage } from "./components/ACFRenderer";
import {
  PostCard,
  PostCardSkeleton,
  Pagination,
  WPContent,
  Nav,
  ErrorBanner,
  Skeleton,
} from "./components/UI";

// ─── Simple hash-based router ──────────────────────────────────────────

function useRoute() {
  const [hash, setHash] = useState(window.location.hash || "#/");
  React.useEffect(() => {
    const update = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  return hash;
}

// ─── Pages ─────────────────────────────────────────────────────────────

function BlogPage() {
  const { posts, status, error, page, setPage, totalPages } = usePosts({
    perPage: 6,
  });

  return (
    <main className="page-content">
      <div className="page-header">
        <h1 className="page-title">Blog</h1>
        <p className="page-subtitle">Les derniers articles depuis WordPress</p>
      </div>

      {status === "error" && <ErrorBanner message={error} />}

      <div className="post-grid">
        {status === "loading"
          ? Array.from({ length: 6 }).map((_, i) => <PostCardSkeleton key={i} />)
          : posts.map((post) => (
              <PostCard
                key={post.id}
                href={`#/post/${post.slug}`}
                title={post.title}
                excerpt={post.excerpt}
                date={post.date}
                image={post.featuredImage}
                categories={post.categories}
              />
            ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </main>
  );
}

function SinglePostPage({ slug }: { slug: string }) {
  const { status, data: post, error } = usePost(slug);

  if (status === "loading")
    return (
      <main className="page-content single-post">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="aspect-video mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </main>
    );

  if (status === "error") return <ErrorBanner message={error} />;
  if (!post) return <ErrorBanner message="Article introuvable" />;

  const heroImage = acfImage(post.acf, "image_hero") ?? post.featuredImage;
  const subtitle = acfText(post.acf, "sous_titre");
  const hasACF = Object.keys(post.acf).length > 0;

  return (
    <main className="page-content single-post">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <a href="#/">Accueil</a>
        <span>/</span>
        <a href="#/blog">Blog</a>
        <span>/</span>
        <span>{post.title}</span>
      </nav>

      {/* Hero */}
      {heroImage && (
        <div className="post-hero">
          <img src={heroImage.url} alt={heroImage.alt} className="post-hero-img" />
          <div className="post-hero-overlay" />
        </div>
      )}

      <article className="post-article">
        {post.categories.length > 0 && (
          <div className="flex gap-2 mb-3">
            {post.categories.map((c) => (
              <span key={c.id} className="tag">{c.name}</span>
            ))}
          </div>
        )}
        <h1 className="post-title">{post.title}</h1>
        {subtitle && <p className="post-subtitle">{subtitle}</p>}

        <time className="post-date">
          {new Date(post.date).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>

        {/* Contenu WP */}
        <WPContent html={post.content} className="mt-8" />

        {/* Champs ACF */}
        {hasACF && (
          <section className="acf-section">
            <h2 className="acf-section-title">Informations complémentaires</h2>
            <ACFRenderer fields={post.acf} showLabels />
          </section>
        )}
      </article>
    </main>
  );
}

function WPPageView({ slug }: { slug: string }) {
  const { status, data: page, error } = usePage(slug);

  if (status === "loading")
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

  if (status === "error") return <ErrorBanner message={error} />;
  if (!page) return <ErrorBanner message="Page introuvable" />;

  const hasACF = Object.keys(page.acf).length > 0;

  return (
    <main className="page-content">
      <h1 className="page-title">{page.title}</h1>
      <WPContent html={page.content} />
      {hasACF && (
        <section className="acf-section">
          <h2 className="acf-section-title">Champs ACF</h2>
          <ACFRenderer fields={page.acf} showLabels />
        </section>
      )}
    </main>
  );
}

function HomePage() {
  const { status, data: options } = useACFOptions();

  const headline =
    status === "success"
      ? acfText(options as Record<string, unknown>, "site_headline") ||
        "Bienvenue sur mon site WordPress Headless"
      : "Bienvenue sur mon site WordPress Headless";

  const heroImg =
    status === "success"
      ? acfImage(options as Record<string, unknown>, "hero_image")
      : null;

  return (
    <main className="page-content">
      {/* Hero */}
      <section className="hero">
        {heroImg && (
          <div className="hero-bg">
            <img src={heroImg.url} alt={heroImg.alt} />
          </div>
        )}
        <div className="hero-content">
          <h1 className="hero-title">{headline}</h1>
          <p className="hero-sub">
            Site React connecté à WordPress via l'API REST + ACF
          </p>
          <div className="hero-ctas">
            <a href="#/blog" className="btn-primary">Voir le blog</a>
            <a href="#/page/about" className="btn-ghost">À propos</a>
          </div>
        </div>
      </section>

      {/* Last posts preview */}
      <section className="section">
        <h2 className="section-title">Derniers articles</h2>
        <BlogPreview />
      </section>
    </main>
  );
}

function BlogPreview() {
  const { posts, status, error } = usePosts({ perPage: 3 });

  if (status === "error") return <ErrorBanner message={error} />;

  return (
    <div className="post-grid">
      {status === "loading"
        ? Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)
        : posts.map((post) => (
            <PostCard
              key={post.id}
              href={`#/post/${post.slug}`}
              title={post.title}
              excerpt={post.excerpt}
              date={post.date}
              image={post.featuredImage}
              categories={post.categories}
            />
          ))}
    </div>
  );
}

// ─── Router ────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 1, title: "Accueil", url: "#/" },
  { id: 2, title: "Blog", url: "#/blog" },
  { id: 3, title: "À propos", url: "#/page/about" },
  { id: 4, title: "Contact", url: "#/page/contact" },
];

export default function App() {
  const route = useRoute();

  let view: React.ReactNode;

  if (route === "#/" || route === "") {
    view = <HomePage />;
  } else if (route === "#/blog") {
    view = <BlogPage />;
  } else if (route.startsWith("#/post/")) {
    const slug = route.replace("#/post/", "");
    view = <SinglePostPage slug={slug} />;
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
          <a href="https://wordpress.org" target="_blank" rel="noreferrer">WordPress</a>
          {" "}×{" "}
          <a href="https://react.dev" target="_blank" rel="noreferrer">React</a>
        </p>
      </footer>
    </div>
  );
}
