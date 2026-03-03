/**
 * Rendu sécurisé du HTML provenant de WordPress.
 * Applique les styles prose Tailwind.
 */
export function WPContent({ html, className = "" }: { html: string; className?: string }) {
  return (
    <div
      className={`prose prose-custom max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
