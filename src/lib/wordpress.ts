export const WP_BASE_URL = import.meta.env.VITE_WP_URL ?? "https://votre-wordpress.com";

const API = `${WP_BASE_URL}/wp-json/wp/v2`;
const ACF_API = `${WP_BASE_URL}/wp-json/acf/v3`;

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

function buildParams(params: QueryParams): URLSearchParams {
  const p = new URLSearchParams();
  if (params.page) p.set("page", String(params.page));
  if (params.perPage) p.set("per_page", String(params.perPage));
  if (params.search) p.set("search", params.search);
  if (params.categories?.length) p.set("categories", params.categories.join(","));
  if (params.tags?.length) p.set("tags", params.tags.join(","));
  if (params.slug) p.set("slug", params.slug);
  if (params.orderby) p.set("orderby", params.orderby);
  if (params.order) p.set("order", params.order);
  if (params.status) p.set("status", params.status);
  if (params.embed !== false) p.set("_embed", "1");
  return p;
}

function parseImage(raw: Record<string, any>): WPImage | null {
  const img = raw?._embedded?.["wp:featuredmedia"]?.[0] ?? raw?._embedded?.["wp:featuredmedia"];
  if (!img) return null;
  return {
    id: img.id,
    url: img.source_url ?? img.guid?.rendered ?? "",
    alt: img.alt_text ?? "",
    width: img.media_details?.width ?? 0,
    height: img.media_details?.height ?? 0,
  };
}

function parseTerms(raw: Record<string, any>, taxonomy: string): WPTerm[] {
  const terms = raw?._embedded?.["wp:term"] ?? [];
  const group = terms.find((t: Record<string, unknown>[]) => t?.[0]?.taxonomy === taxonomy);
  return (group ?? []).map((t: Record<string, unknown>) => ({
    id: t.id as number,
    name: t.name as string,
    slug: t.slug as string,
  }));
}

function parsePost(raw: Record<string, any>): WPPost {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title?.rendered ?? "",
    excerpt: raw.excerpt?.rendered ?? "",
    content: raw.content?.rendered ?? "",
    date: raw.date,
    modified: raw.modified,
    featuredImage: parseImage(raw),
    categories: parseTerms(raw, "category"),
    tags: parseTerms(raw, "post_tag"),
    acf: raw.acf ?? {},
  };
}

function parsePage(raw: Record<string, any>): WPPage {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title?.rendered ?? "",
    content: raw.content?.rendered ?? "",
    acf: raw.acf ?? {},
  };
}

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`WP API error ${res.status} – ${url}`);
  }
  return res.json();
}

export async function getPosts(params: QueryParams = {}): Promise<{
  posts: WPPost[];
  total: number;
  totalPages: number;
}> {
  const url = `${API}/posts?${buildParams(params).toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WP API ${res.status}`);
  const total = Number(res.headers.get("X-WP-Total") ?? 0);
  const totalPages = Number(res.headers.get("X-WP-TotalPages") ?? 0);
  const data = (await res.json()) as Record<string, any>[];
  return { posts: data.map(parsePost), total, totalPages };
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const { posts } = await getPosts({ slug, perPage: 1 });
  return posts[0] ?? null;
}

export async function getPostById(id: number): Promise<WPPost> {
  const raw = await fetcher<Record<string, any>>(`${API}/posts/${id}?_embed=1`);
  return parsePost(raw);
}

export async function getPages(params: QueryParams = {}): Promise<WPPage[]> {
  const raw = await fetcher<Record<string, any>[]>(`${API}/pages?${buildParams(params).toString()}`);
  return raw.map(parsePage);
}

export async function getPageBySlug(slug: string): Promise<WPPage | null> {
  const pages = await getPages({ slug, perPage: 1 });
  return pages[0] ?? null;
}

export async function getCPT<T extends Record<string, unknown>>(
  cptSlug: string,
  params: QueryParams = {}
): Promise<T[]> {
  const url = `${API}/${cptSlug}?${buildParams(params).toString()}`;
  return fetcher<T[]>(url);
}

export interface ACFOptions {
  [key: string]: unknown;
}

export async function getACFOptions(): Promise<ACFOptions> {
  return fetcher<ACFOptions>(`${ACF_API}/options/options`);
}

export async function getACFForPost(postId: number): Promise<Record<string, unknown>> {
  return fetcher<Record<string, unknown>>(`${ACF_API}/posts/${postId}`);
}

export async function getACFForPage(pageId: number): Promise<Record<string, unknown>> {
  return fetcher<Record<string, unknown>>(`${ACF_API}/pages/${pageId}`);
}

export async function getACFForCPT(cptSlug: string, postId: number): Promise<Record<string, unknown>> {
  return fetcher<Record<string, unknown>>(`${ACF_API}/${cptSlug}/${postId}`);
}

export async function getCategories(): Promise<WPTerm[]> {
  return fetcher<WPTerm[]>(`${API}/categories?per_page=100`);
}

export async function getTags(): Promise<WPTerm[]> {
  return fetcher<WPTerm[]>(`${API}/tags?per_page=100`);
}

export async function getMenu(menuSlug: string): Promise<WPMenuItem[]> {
  const raw = await fetcher<{ items: WPMenuItem[] }>(`${WP_BASE_URL}/wp-json/menus/v1/menus/${menuSlug}`);
  return raw?.items ?? [];
}
