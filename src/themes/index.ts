// ─── Système de thèmes annuels ────────────────────────────────────────────────
//
// Pour ajouter un nouveau thème (ex: "2027") :
//   1. Créer src/themes/2027/Decorations.tsx
//   2. Ajouter un bloc html.theme-2027 { ... } dans src/index.css
//   3. Ajouter l'entrée "2027" dans THEMES ci-dessous
//   4. Changer ACTIVE_THEME dans src/config/site.ts → "2027"
//
// Pour switcher de thème : modifier ACTIVE_THEME dans src/config/site.ts + rebuild.

export type ThemeName = "base" | "2024" | "2025" | "2026";

export interface ThemeConfig {
  /** Classe CSS appliquée sur <html> : ex. "theme-2025" */
  cssClass: string;
  /**
   * URL Google Fonts à injecter dynamiquement via une balise <link>.
   * null = polices déjà chargées (index.html) ou polices système suffisantes.
   */
  fontsUrl: string | null;
  /** Nom lisible pour le débogage et la documentation. */
  label: string;
}

export const THEMES: Record<ThemeName, ThemeConfig> = {
  base: {
    cssClass: "theme-base",
    fontsUrl: null,
    label: "Base (neutre, noir et blanc)",
  },
  "2024": {
    cssClass: "theme-2024",
    fontsUrl: null, // Playfair Display + DM Sans déjà déclarés dans index.html
    label: "2024 (beige chaud, Playfair Display)",
  },
  "2025": {
    cssClass: "theme-2025",
    fontsUrl:
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=optional",
    label: "2025 (bleu, arrondi, stickers)",
  },
  "2026": {
    cssClass: "theme-2026",
    fontsUrl:
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=optional",
    label: "2026 (rose, carré, Space Grotesk)",
  },
};
