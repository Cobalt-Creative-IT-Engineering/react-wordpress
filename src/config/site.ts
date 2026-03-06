// ─── Thème actif ──────────────────────────────────────────────────────────────
// Changer cette valeur et rebuilder pour changer l'identité visuelle du site.
// Valeurs disponibles : "base" | "2024" | "2025" | "2026"
import type { ThemeName } from "../themes/index";
export const ACTIVE_THEME: ThemeName = "2026";

// ─── Site Configuration ────────────────────────────────────────────────────
// Centralise le nom du site, la langue et les éléments de navigation.
// Modifie NAV_ITEMS pour ajouter / supprimer des pages.

export const SITE_CONFIG = {
  name:        "Francomanias",
  lang:        "fr",
  description: "Festival de musiques actuelles à Bulle, Suisse.",
} as const;

// cta: true → s'affiche à droite du nav en style pilule (Programmation, Billetterie)
// cta: false → lien standard à gauche du nav
export const NAV_ITEMS = [
  { id: 1, title: "Le Festival",   url: "#/festival",      cta: false },
  { id: 2, title: "Infos pratiques", url: "#/informations",  cta: false },
  { id: 3, title: "Programmation", url: "#/programmation", cta: true  },
  { id: 4, title: "Billetterie",   url: "https://google.ch/", cta: true },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
