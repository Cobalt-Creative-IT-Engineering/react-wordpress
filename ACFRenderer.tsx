// ============================================================
//  ACFRenderer  –  Affiche automatiquement les champs ACF
//  selon leur type détecté
// ============================================================

import React from "react";

interface ACFRendererProps {
  fields: Record<string, unknown>;
  /** Classes CSS à appliquer sur le wrapper */
  className?: string;
  /** Afficher les labels des champs ? */
  showLabels?: boolean;
}

// Détecte si une valeur est une image ACF (objet avec url/sizes)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isACFImage(v: unknown): v is { url: string; alt: string; width: number; height: number } {
  return typeof v === "object" && v !== null && "url" in v && "alt" in v;
}

// Détecte une relation/post object ACF
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isACFPost(v: unknown): v is { ID: number; post_title: string; permalink: string } {
  return typeof v === "object" && v !== null && "ID" in v && "post_title" in v;
}

function ACFValue({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") return null;

  // Image
  if (isACFImage(value)) {
    return (
      <img
        src={value.url}
        alt={value.alt}
        width={value.width}
        height={value.height}
        className="rounded-lg w-full object-cover"
      />
    );
  }

  // Post object / relation
  if (isACFPost(value)) {
    return (
      <a href={value.permalink} className="text-accent underline underline-offset-2">
        {value.post_title}
      </a>
    );
  }

  // Array (repeater, relationship, checkboxes…)
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    if (typeof value[0] === "string" || typeof value[0] === "number") {
      return (
        <ul className="flex flex-wrap gap-2">
          {value.map((item, i) => (
            <li key={i} className="px-2 py-0.5 bg-surface-2 rounded text-sm">
              {String(item)}
            </li>
          ))}
        </ul>
      );
    }
    // Nested objects (repeater rows)
    return (
      <div className="space-y-3">
        {value.map((row, i) => (
          <ACFRenderer key={i} fields={row as Record<string, unknown>} showLabels />
        ))}
      </div>
    );
  }

  // HTML / WYSIWYG (contient des balises)
  if (typeof value === "string" && /<[a-z][\s\S]*>/i.test(value)) {
    return (
      <div
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }

  // URL / lien
  if (typeof value === "string" && value.startsWith("http")) {
    return (
      <a href={value} target="_blank" rel="noreferrer" className="text-accent break-all">
        {value}
      </a>
    );
  }

  // Booléen
  if (typeof value === "boolean") {
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${value ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
        {value ? "Oui" : "Non"}
      </span>
    );
  }

  // Objet générique (groupe ACF)
  if (typeof value === "object") {
    return <ACFRenderer fields={value as Record<string, unknown>} showLabels />;
  }

  // Texte / nombre simple
  return <span className="text-text-secondary">{String(value)}</span>;
}

export function ACFRenderer({ fields, className = "", showLabels = false }: ACFRendererProps) {
  const entries = Object.entries(fields).filter(
    ([, v]) => v !== null && v !== undefined && v !== ""
  );

  if (entries.length === 0) return null;

  return (
    <div className={`acf-renderer space-y-4 ${className}`}>
      {entries.map(([key, value]) => (
        <div key={key} className="acf-field">
          {showLabels && (
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-1">
              {key.replace(/_/g, " ")}
            </p>
          )}
          <ACFValue value={value} />
        </div>
      ))}
    </div>
  );
}

// ─── Helpers utilitaires pour accéder aux champs ACF ───────────────────

/** Récupère un champ ACF texte (fallback "") */
export function acfText(acf: Record<string, unknown>, key: string): string {
  return typeof acf[key] === "string" ? (acf[key] as string) : "";
}

/** Récupère un champ ACF image */
export function acfImage(
  acf: Record<string, unknown>,
  key: string
): { url: string; alt: string } | null {
  const v = acf[key];
  if (isACFImage(v)) return { url: v.url, alt: v.alt };
  if (typeof v === "string" && v.startsWith("http")) return { url: v, alt: "" };
  return null;
}

/** Récupère un champ ACF booléen */
export function acfBool(acf: Record<string, unknown>, key: string): boolean {
  return Boolean(acf[key]);
}

/** Récupère un repeater ACF sous forme de tableau */
export function acfRepeater<T>(acf: Record<string, unknown>, key: string): T[] {
  return Array.isArray(acf[key]) ? (acf[key] as T[]) : [];
}
