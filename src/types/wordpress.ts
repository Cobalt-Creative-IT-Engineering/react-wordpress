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
