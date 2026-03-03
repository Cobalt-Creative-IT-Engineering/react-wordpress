/**
 * Schémas ACF par type de contenu.
 *
 * Chaque schéma mappe un nom sémantique TypeScript vers la vraie clé de
 * champ ACF dans WordPress. Mets à jour ces valeurs quand tu renommes
 * un champ dans ACF.
 *
 * Usage :
 *   import { acfReader } from '../components/acf';
 *   import { HeroACF } from '../config/acf-schemas';
 *
 *   const hero = acfReader(options, HeroACF);
 *   const title = hero.text('title');   // TypeScript autocomplete sur les clés
 *   const logo  = hero.image('logo');
 */

// ─── Options globales (ACF Options Page) ─────────────────────────────────

export const HeroACF = {
  title:        "hero_title",
  subtitle:     "hero_subtitle",
  dateLocation: "hero_date_location",
  videoUrl:     "hero_video_url",
  logo:         "hero_logo",
} as const;

export const PartnersACF = {
  list: "partenaires",  // repeater ACF → sous-champs : logo (image), url (link)
} as const;

export const BilletterieACF = {
  url:    "billetterie_url",
  urlAlt: "ticketing_url",
} as const;

// ─── Custom Post Types ────────────────────────────────────────────────────

export const ArtistACF = {
  nom:         "nom",
  photo:       "photo",
  date:        "date",                      // date_picker → "YYYYMMDD"
  infos:       "infos",                     // wysiwyg — bio HTML
  liens:       "liens",                     // repeater → { nom_du_lien, lien }
  billetterie: "lien_vers_la_billetterie",  // url directe billetterie artiste
} as const;

// ─── Pages WP ─────────────────────────────────────────────────────────────
// Champs ACF définis dans acf-import-pages-2026.json
// Page WP attendue : slug "informations-pratiques"

export const InformationsACF = {
  transports:   "transports_contenu",
  horaires:     "horaires_contenu",
  scenes:       "scenes_contenu",
  restauration: "restauration_contenu",
  securite:     "securite_contenu",
  hebergement:  "hebergement_contenu",
} as const;

// Page WP attendue : slug "le-festival"
export const HistoireACF = {
  presentation: "presentation_contenu",
  image:        "presentation_image",
  mission:      "mission_valeurs",
} as const;

// ─── Type utilitaire ──────────────────────────────────────────────────────

/** Type d'un schéma ACF générique */
export type ACFSchema = Record<string, string>;
