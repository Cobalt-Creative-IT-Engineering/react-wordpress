import { useState, useEffect } from "react";

function normalizeHash(rawHash: string): string {
  const fallback = "#/";
  if (!rawHash || rawHash === "#") return fallback;
  const hash = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash;
  const pathOnly = hash.split("#")[0];
  if (!pathOnly || pathOnly === "/") return fallback;
  return `#${pathOnly}`;
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
}

/**
 * Hook de routing basé sur le hash de l'URL (#/).
 * Aucune dépendance serveur — fonctionne en déploiement statique (Netlify, etc.).
 */
export function useRoute(): RouteResult {
  const [hash, setHash] = useState(() =>
    normalizeHash(window.location.hash || "#/")
  );

  useEffect(() => {
    const update = () => setHash(normalizeHash(window.location.hash || "#/"));
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  const path = hash.slice(1); // retire le "#" de tête
  const pageMatch = hash.match(/^#\/page\/(.+)$/);
  const slug = pageMatch ? pageMatch[1] : null;

  return { route: hash, path, slug };
}
