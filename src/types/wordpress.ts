// ─── WordPress Core Types ─────────────────────────────────────────────────

export interface WPImage {
  id: number;
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface WPTerm {
  id: number;
  name: string;
  slug: string;
}

export interface WPTaxonomyTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy?: string;
}

export interface WPPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  modified: string;
  featuredImage: WPImage | null;
  categories: WPTerm[];
  tags: WPTerm[];
  acf: Record<string, unknown>;
}

export interface WPPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  acf: Record<string, unknown>;
}

export interface WPMenuItem {
  id: number;
  title: string;
  url: string;
  order: number;
  parent: number;
  children?: WPMenuItem[];
}

// ─── API Params ────────────────────────────────────────────────────────────

export interface QueryParams {
  page?: number;
  perPage?: number;
  search?: string;
  categories?: number[];
  tags?: number[];
  slug?: string;
  orderby?: "date" | "title" | "menu_order";
  order?: "asc" | "desc";
  status?: "publish" | "draft" | "any";
  embed?: boolean;
  /** Filtrage par IDs (include=1,2,3 → /wp/v2/cpt?include=1,2,3) */
  include?: number[];
  /** Filtres par taxonomies personnalisées, ex: { categorie: 5, jour: [2,3] } */
  taxonomies?: Record<string, number | string | (number | string)[]>;
}

export interface ACFOptions {
  [key: string]: unknown;
}

// ─── Hook Types ────────────────────────────────────────────────────────────

export type FetchStatus = "idle" | "loading" | "success" | "error";

export type FetchState<T> = {
  status: FetchStatus;
  data: T | null;
  error: string | null;
  isFetching: boolean;
};

export interface UsePostsOptions extends QueryParams {
  enabled?: boolean;
}

// ─── Custom Post Types ────────────────────────────────────────────────────

/** Entrée du custom post type "artiste" */
export type ProgrammationEntry = {
  id: number;
  slug: string;
  date?: string;
  title?: { rendered?: string };
  acf?: Record<string, unknown>;
  /** IDs des termes de taxonomie "jour" */
  jour?: number[];
  /** IDs des termes de taxonomie "lieu" */
  lieu?: number[];
};

/** Entrée du custom post type "partenaire" */
export type PartenaireEntry = {
  id: number;
  slug: string;
  title?: { rendered?: string };
  acf?: {
    logo?: number | { url: string; alt?: string };
    lien?: string;
    categorie_du_partenaire?: number[];
  };
  /** IDs des termes de taxonomie "categorie" */
  categorie?: number[];
};

/** Entrée du custom post type "ancienne-edition" */
export type AncieneEditionEntry = {
  id: number;
  slug: string;
  title?: { rendered?: string };
  acf?: {
    annee?: string;
    photo?: number | { url: string; alt?: string };
    description?: string;
    programmation?: { url: string; filename?: string } | number;
    grille_horaire?: { url: string; filename?: string } | number;
  };
};

/** Entrée du custom post type "actualite" */
export type ActualiteEntry = {
  id: number;
  slug: string;
  date?: string;
  title?: { rendered?: string };
  acf?: {
    photo?: number | { url: string; alt?: string };
    contenu?: string;
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string; alt_text?: string }>;
  };
};

// ─── GraphQL (WPGraphQL + ACF) ────────────────────────────────────────────

export type GQLImage = {
  sourceUrl: string;
  altText?: string;
};

/**
 * Options page "Le Festival" — graphql_type_name: LeFestival
 * Chaque groupe ACF crée un sous-objet nommé d'après son graphql_field_name.
 */
export type GQLLeFestival = {
  /** group → graphql_field_name: leFestivalPresentation */
  leFestivalPresentation?: {
    presentationContenu?: string;
    missionValeurs?:      string;
    /** AcfMediaItemConnectionEdge — accéder via .node */
    presentationImage?: { node: GQLImage } | null;
  };
  /** group → graphql_field_name: leFestivalEquipe */
  leFestivalEquipe?: {
    equipe?: Array<{ nom: string; role?: string; photo?: { node: GQLImage } | null }>;
  };
  /** group → graphql_field_name: leFestivalArchives — sous-champ image (pas photo) */
  leFestivalArchives?: {
    archives?: Array<{ annee: string; image?: { node: GQLImage } | null }>;
  };
  /** group → graphql_field_name: leFestivalContact */
  leFestivalContact?: {
    contactBlocs?: Array<{ titre: string; email?: string; tel?: string; adresse?: string }>;
  };
  /** group → graphql_field_name: leFestivalPresse */
  leFestivalPresse?: {
    presseLiens?:       Array<{ label: string; url: string }>;
    photographesLiens?: Array<{ label: string; url: string }>;
  };
};

/**
 * Options page "Informations Pratiques" — graphql_type_name: InformationsPratiques
 * groupe → graphql_field_name: infosPratiques
 */
export type GQLInfosPratiques = {
  infosPratiques?: {
    transportsContenu?:   string;
    horairesContenu?:     string;
    scenesContenu?:       string;
    restaurationContenu?: string;
    securiteContenu?:     string;
    hebergementContenu?:  string;
  };
};

export type GQLAllOptions = {
  leFestival?:            GQLLeFestival;
  informationsPratiques?: GQLInfosPratiques;
};
