import type { WPTerm } from "../../types/wordpress";

interface PostCardProps {
  title: string;
  excerpt: string;
  date: string;
  image?: { url: string; alt: string } | null;
  categories?: WPTerm[];
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
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {categories.map((c) => (
            <span key={c.id} className="tag">
              {c.name}
            </span>
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
