import React from "react";

// ─── Loading Skeleton ──────────────────────────────────────────────────

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-surface-2 via-surface-3 to-surface-2 bg-[length:200%_100%] rounded-lg ${className}`}
      style={{ animation: "shimmer 1.6s infinite linear" }}
    />
  );
}

export function PostCardSkeleton() {
  return (
    <div className="card space-y-3">
      <Skeleton className="aspect-video" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

// ─── Error Banner ──────────────────────────────────────────────────────

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400 text-sm">
      <strong className="block font-semibold mb-1">Erreur</strong>
      {message}
    </div>
  );
}

// ─── Post Card ─────────────────────────────────────────────────────────

interface PostCardProps {
  title: string;
  excerpt: string;
  date: string;
  image?: { url: string; alt: string } | null;
  categories?: { id: number; name: string; slug: string }[];
  href: string;
}

export function PostCard({ title, excerpt, date, image, categories, href }: PostCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <a href={href} className="card group block overflow-hidden no-underline">
      {image && (
        <div className="overflow-hidden rounded-lg mb-4 aspect-video">
          <img
            src={image.url}
            alt={image.alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {categories.map((c) => (
            <span key={c.id} className="tag">{c.name}</span>
          ))}
        </div>
      )}
      <h2 className="text-lg font-display font-semibold text-text-primary group-hover:text-accent transition-colors leading-snug mb-2">
        {title}
      </h2>
      <p
        className="text-sm text-text-secondary line-clamp-3 mb-4"
        dangerouslySetInnerHTML={{ __html: excerpt }}
      />
      <time className="text-xs text-text-muted">{formattedDate}</time>
    </a>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}

export function Pagination({ page, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="btn-ghost px-3"
      >
        ←
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`btn-ghost px-3 ${p === page ? "text-accent border-accent" : ""}`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="btn-ghost px-3"
      >
        →
      </button>
    </nav>
  );
}

// ─── HTML Content (WordPress) ──────────────────────────────────────────

export function WPContent({ html, className = "" }: { html: string; className?: string }) {
  return (
    <div
      className={`prose prose-custom max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ─── Nav ───────────────────────────────────────────────────────────────

interface NavProps {
  items: { id: number; title: string; url: string }[];
  siteName?: string;
}

export function Nav({ items, siteName = "Mon Site" }: NavProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="nav-wrapper">
      <nav className="nav-inner">
        <a href="/" className="nav-logo">{siteName}</a>
        {/* Desktop */}
        <ul className="nav-links">
          {items.map((item) => (
            <li key={item.id}>
              <a href={item.url} className="nav-link">{item.title}</a>
            </li>
          ))}
        </ul>
        {/* Mobile toggle */}
        <button
          className="nav-hamburger md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          <span className={`ham-line ${open ? "rotate-45 translate-y-1.5" : ""}`} />
          <span className={`ham-line ${open ? "opacity-0" : ""}`} />
          <span className={`ham-line ${open ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>
      </nav>
      {/* Mobile menu */}
      {open && (
        <div className="mobile-menu">
          {items.map((item) => (
            <a key={item.id} href={item.url} className="mobile-link" onClick={() => setOpen(false)}>
              {item.title}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
