import { useState, useEffect } from "react";

interface ParsedHash {
  route: string;
  anchor: string | null;
}

function parseHash(rawHash: string): ParsedHash {
  const fallback = { route: "#/", anchor: null };
  if (!rawHash || rawHash === "#") return fallback;
  const withoutLeading = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash;
  const parts = withoutLeading.split("#");
  const pathOnly = parts[0].replace(/\/$/, ""); // supprime le trailing slash
  const anchor = parts[1] || null;
  if (!pathOnly || pathOnly === "/") return { route: "#/", anchor };
  return { route: `#${pathOnly}`, anchor };
}

export interface RouteResult {
  /** Hash complet normalisé, ex: "#/programmation" */
  route: string;
  /** Chemin sans le "#" de tête, ex: "/programmation" */
  path: string;
  /**
   * Slug extrait pour les routes "#/page/:slug".
   * null si la route n'est pas de ce format.
   */
  slug: string | null;
  /** Ancre extraite après le 2e "#", ex: "contact" dans "#/festival/#contact" */
  anchor: string | null;
}

/**
 * Hook de routing basé sur le hash de l'URL (#/).
 * Aucune dépendance serveur — fonctionne en déploiement statique (Netlify, etc.).
 */
export function useRoute(): RouteResult {
  const [parsed, setParsed] = useState(() =>
    parseHash(window.location.hash || "#/")
  );

  useEffect(() => {
    const update = () => setParsed(parseHash(window.location.hash || "#/"));
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  const { route, anchor } = parsed;
  const path = route.slice(1); // retire le "#" de tête
  const pageMatch = route.match(/^#\/page\/(.+)$/);
  const slug = pageMatch ? pageMatch[1] : null;

  return { route, path, slug, anchor };
}
