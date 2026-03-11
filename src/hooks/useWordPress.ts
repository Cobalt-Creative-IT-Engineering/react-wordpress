import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  getPosts,
  getPostBySlug,
  getPageBySlug,
  getACFOptions,
  getACFForPost,
  getCPT,
  getCategories,
  getTaxonomyTerms,
  getMediaByIds,
  getACFOptionsPage,
  graphqlFetch,
} from "../lib/wordpress";
import type {
  WPPost,
  WPPage,
  ACFOptions,
  QueryParams,
  WPTaxonomyTerm,
  FetchState,
  UsePostsOptions,
  GQLAllOptions,
} from "../types/wordpress";

// Re-export des types utiles
export type { WPPost, WPPage, ACFOptions, QueryParams, WPTaxonomyTerm, FetchState, UsePostsOptions };

// ─── Cache en mémoire ─────────────────────────────────────────────────────

const memoryCache = new Map<string, { data: unknown; updatedAt: number }>();
const DEFAULT_STALE_MS   = 60_000;
const SESSION_STALE_MS   = 30 * 60_000; // 30 min pour sessionStorage
const SESSION_PREFIX     = "wp:";

// ─── Sérialisation sessionStorage (gère les Maps) ─────────────────────────

function sessionWrite(key: string, data: unknown): void {
  try {
    const value = data instanceof Map
      ? { __map: true, entries: Array.from((data as Map<unknown, unknown>).entries()) }
      : data;
    sessionStorage.setItem(
      SESSION_PREFIX + key,
      JSON.stringify({ v: value, t: Date.now() })
    );
  } catch { /* quota exceeded ou private mode : on ignore */ }
}

function sessionRead<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(SESSION_PREFIX + key);
    if (!raw) return null;
    const { v, t } = JSON.parse(raw) as { v: unknown; t: number };
    if (Date.now() - t > SESSION_STALE_MS) return null;
    if (v && typeof v === "object" && (v as Record<string, unknown>).__map === true) {
      return new Map((v as { entries: [unknown, unknown][] }).entries) as unknown as T;
    }
    return v as T;
  } catch { return null; }
}

// ─── Hook interne useFetch ────────────────────────────────────────────────

function useFetch<T>(
  fetcher: () => Promise<T>,
  options: { cacheKey?: string; staleMs?: number; persist?: boolean } = {}
) {
  const cacheKey = options.cacheKey;
  const staleMs  = options.staleMs ?? DEFAULT_STALE_MS;
  const persist  = options.persist ?? false;
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const initialCached = useMemo(() => {
    if (!cacheKey) return null;
    // 1. Mémoire (prioritaire, déjà frais)
    const mem = memoryCache.get(cacheKey);
    if (mem) return mem.data as T;
    // 2. sessionStorage (survit aux reloads)
    if (persist) return sessionRead<T>(cacheKey);
    return null;
  }, [cacheKey, persist]);

  const [state, setState] = useState<FetchState<T>>({
    status:     initialCached ? "success" : "loading",
    data:       initialCached,
    error:      null,
    isFetching: !initialCached,
  });

  const load = useCallback(
    async (force = false) => {
      const now = Date.now();
      if (!force && cacheKey) {
        const cached = memoryCache.get(cacheKey);
        if (cached && now - cached.updatedAt < staleMs) {
          setState({ status: "success", data: cached.data as T, error: null, isFetching: false });
          return;
        }
      }

      setState((prev) => ({
        status:     prev.data ? "success" : "loading",
        data:       prev.data,
        error:      null,
        isFetching: true,
      }));

      try {
        const data = await fetcherRef.current();
        if (cacheKey) {
          memoryCache.set(cacheKey, { data, updatedAt: Date.now() });
          if (persist) sessionWrite(cacheKey, data);
        }
        setState({ status: "success", data, error: null, isFetching: false });
      } catch (e) {
        setState((prev) => ({
          status:     prev.data ? "success" : "error",
          data:       prev.data,
          error:      prev.data ? null : (e as Error).message,
          isFetching: false,
        }));
      }
    },
    [cacheKey, staleMs, persist]
  );

  useEffect(() => {
    void load();
  }, [load, cacheKey, staleMs]);

  return { ...state, refetch: () => load(true) };
}

// ─── Hooks publics ────────────────────────────────────────────────────────

export function usePosts(options: UsePostsOptions = {}) {
  const { enabled = true, ...params } = options;
  const [page, setPage] = useState(params.page ?? 1);

  const state = useFetch(
    () =>
      enabled
        ? getPosts({ ...params, page })
        : Promise.resolve({ posts: [], total: 0, totalPages: 0 }),
    { cacheKey: `posts:${JSON.stringify({ ...params, page, enabled })}`, persist: true }
  );

  return {
    ...state,
    posts:      state.data?.posts ?? [],
    total:      state.data?.total ?? 0,
    totalPages: state.data?.totalPages ?? 0,
    page,
    setPage,
  };
}

export function usePost(slug: string) {
  return useFetch<WPPost | null>(
    () => (slug ? getPostBySlug(slug) : Promise.resolve(null)),
    { cacheKey: `post:${slug}`, persist: true }
  );
}

export function usePage(slug: string) {
  return useFetch<WPPage | null>(
    () => (slug ? getPageBySlug(slug) : Promise.resolve(null)),
    { cacheKey: `page:${slug}`, persist: true }
  );
}

export function useACFOptions() {
  return useFetch<ACFOptions>(
    () => getACFOptions(),
    { cacheKey: "acf-options", staleMs: 120_000, persist: true }
  );
}

export function useACFPost(postId: number | null) {
  return useFetch<Record<string, unknown>>(
    () => (postId ? getACFForPost(postId) : Promise.resolve({})),
    { cacheKey: `acf-post:${postId ?? "none"}` }
  );
}

export function useCPT<T extends Record<string, unknown>>(
  cptSlug: string,
  params: QueryParams = {}
) {
  return useFetch<T[]>(
    () => (cptSlug ? getCPT<T>(cptSlug, params) : Promise.resolve([])),
    { cacheKey: `cpt:${cptSlug}:${JSON.stringify(params)}`, persist: true }
  );
}

export function useCategories() {
  return useFetch(() => getCategories(), { cacheKey: "categories", persist: true });
}

/**
 * Résout une liste d'IDs d'attachments WP en Map<id, { url, alt }>.
 * Fait un seul appel batch à /wp/v2/media.
 */
export function useMediaBatch(ids: number[]) {
  const key = [...ids].sort((a, b) => a - b).join(",");
  return useFetch<Map<number, { url: string; alt: string }>>(
    () => getMediaByIds(ids),
    { cacheKey: `media:${key}`, persist: true }
  );
}

export function useTaxonomyTerms(taxonomy: string, params: QueryParams = {}) {
  return useFetch<WPTaxonomyTerm[]>(
    () => (taxonomy ? getTaxonomyTerms(taxonomy, params) : Promise.resolve([])),
    { cacheKey: `taxonomy:${taxonomy}:${JSON.stringify(params)}`, persist: true }
  );
}

/**
 * Lit les champs ACF d'une Options Sub-Page enregistrée dans WP via
 * acf_add_options_sub_page(['menu_slug' => $slug]).
 * Endpoint : /wp-json/acf/v3/options/{slug}
 */
export function useACFOptionsPage(slug: string) {
  return useFetch<Record<string, unknown>>(
    () => (slug ? getACFOptionsPage(slug) : Promise.resolve({})),
    { cacheKey: `acf-options-page:${slug}`, staleMs: 120_000, persist: true }
  );
}

// ─── Prefetch ─────────────────────────────────────────────────────────────

/**
 * Pré-remplit le cache mémoire pour une liste d'entrées CPT + leurs médias.
 * À appeler en arrière-plan (fire & forget) quand la liste est chargée.
 * Les requêtes sont parallèles ; si une entrée est déjà en cache, on la skippe.
 */
export async function prefetchCPTItems(
  cptSlug: string,
  items: { slug: string; photoIds?: number[] }[]
): Promise<void> {
  await Promise.all(
    items.map(async ({ slug, photoIds = [] }) => {
      // ── Article ──────────────────────────────────────────────────────────
      const entryKey = `cpt:${cptSlug}:${JSON.stringify({ slug, perPage: 1 })}`;
      const entryFetch = memoryCache.has(entryKey)
        ? Promise.resolve()
        : getCPT(cptSlug, { slug, perPage: 1 }).then((data) =>
            memoryCache.set(entryKey, { data, updatedAt: Date.now() })
          ).catch(() => {});

      // ── Médias ───────────────────────────────────────────────────────────
      const validIds = photoIds.filter((id) => id > 0);
      const mediaKey = `media:${[...validIds].sort((a, b) => a - b).join(",")}`;
      const mediaFetch = !validIds.length || memoryCache.has(mediaKey)
        ? Promise.resolve()
        : getMediaByIds(validIds).then((data) =>
            memoryCache.set(mediaKey, { data, updatedAt: Date.now() })
          ).catch(() => {});

      await Promise.all([entryFetch, mediaFetch]);
    })
  );
}

/**
 * Préchauffe en parallèle toutes les données des pages Le Festival et
 * Infos Pratiques : GraphQL options + CPT archives + CPT partenaires +
 * taxonomie catégorie. À appeler en fire & forget au démarrage de l'app.
 */
export function prefetchFestivalData(): void {
  const now = Date.now();
  const STALE = 120_000;

  const warm = <T>(key: string, fetcher: () => Promise<T>) => {
    const cached = memoryCache.get(key);
    if (cached && now - cached.updatedAt < STALE) return Promise.resolve();
    return fetcher()
      .then((data) => { memoryCache.set(key, { data, updatedAt: Date.now() }); })
      .catch(() => {});
  };

  // Lance tout en parallèle — aucune dépendance entre ces requêtes
  void Promise.all([
    warm("gql-options",             () => graphqlFetch(GQL_ALL_OPTIONS)),
    warm('cpt:ancienne-edition:{"perPage":30,"orderby":"title","order":"desc"}',
         () => getCPT("ancienne-edition", { perPage: 30, orderby: "title", order: "desc" })),
    warm('cpt:partenaire:{"perPage":50}',
         () => getCPT("partenaire", { perPage: 50 })),
    warm('taxonomy:categorie:{}',
         () => getTaxonomyTerms("categorie", {})),
  ]);
}

// ─── GraphQL ──────────────────────────────────────────────────────────────

const GQL_ALL_OPTIONS = `
  query GetAllOptions {
    leFestival {
      leFestivalPresentation {
        presentationContenu
        missionValeurs
        presentationImage { node { sourceUrl altText } }
      }
      leFestivalEquipe {
        equipe { nom role photo { node { sourceUrl altText } } }
      }
      leFestivalArchives {
        archives { annee image { node { sourceUrl altText } } }
      }
      leFestivalContact {
        contactBlocs { titre email tel adresse }
      }
      leFestivalPresse {
        presseLiens { label url }
        photographesLiens { label url }
      }
    }
    informationsPratiques {
      infosPratiques {
        transportsContenu
        horairesContenu
        scenesContenu
        restaurationContenu
        securiteContenu
        hebergementContenu
      }
    }
  }
`;

/**
 * Repeater lieu_contenu (Scènes & Lieux) — query séparée car le champ
 * doit être configuré dans WPGraphQL avant d'être ajouté à la query stable.
 */
const GQL_LIEUX_OPTIONS = `
  query GetLieuxOptions {
    informationsPratiques {
      infosPratiques {
        lieuContenu {
          nomDuLieu
          description
          photo { node { sourceUrl altText } }
        }
      }
    }
  }
`;

/**
 * Billetterie + Mentions légales + Conditions générales.
 * Tous des champs scalaires (String/URL/wysiwyg) — query très stable.
 */
const GQL_SITE_OPTIONS = `
  query GetSiteOptions {
    billetterie {
      billeterieOptions {
        url
      }
    }
    mentionsLegales {
      mentionsLegalesContent {
        presentationContenu
      }
    }
    conditionsGenerales {
      conditionsGeneralesContent {
        presentationContenu
      }
    }
  }
`;

/**
 * Programmation — séparée car le champ `file` WPGraphQL retourne une connexion
 * MediaItem, pas un String scalaire.
 */
const GQL_PROG_OPTIONS = `
  query GetProgOptions {
    programmation {
      programmationOptions {
        grilleHoraireUrl {
          node {
            sourceUrl
          }
        }
      }
    }
  }
`;

/**
 * Charge les options pages Le Festival + Infos Pratiques.
 * Query stable — ne change pas quand on ajoute de nouvelles options pages WP.
 */
export function useGraphQLOptions() {
  return useFetch<GQLAllOptions>(
    () => graphqlFetch<GQLAllOptions>(GQL_ALL_OPTIONS),
    { cacheKey: "gql-options", staleMs: 120_000, persist: true }
  );
}

/**
 * Charge Billetterie, Mentions légales, Conditions générales.
 * Échoue silencieusement si les pages n'existent pas encore dans WP.
 */
export function useGraphQLSiteOptions() {
  return useFetch<GQLAllOptions>(
    () => graphqlFetch<GQLAllOptions>(GQL_SITE_OPTIONS).catch(() => ({} as GQLAllOptions)),
    { cacheKey: "gql-site-options", staleMs: 120_000, persist: true }
  );
}

/**
 * Charge l'URL de la grille horaire (champ `file` WPGraphQL = connexion MediaItem).
 * Échoue silencieusement si la page n'existe pas encore dans WP.
 */
export function useGraphQLProgrammationOptions() {
  return useFetch<GQLAllOptions>(
    () => graphqlFetch<GQLAllOptions>(GQL_PROG_OPTIONS).catch(() => ({} as GQLAllOptions)),
    { cacheKey: "gql-prog-options", staleMs: 120_000, persist: true }
  );
}

/**
 * Charge le repeater lieu_contenu (Scènes & Lieux).
 * Séparé de GQL_ALL_OPTIONS pour ne pas casser Le Festival/InfosPratiques
 * si le champ n'est pas encore configuré dans WPGraphQL.
 */
export function useGraphQLLieuxOptions() {
  return useFetch<GQLAllOptions>(
    () => graphqlFetch<GQLAllOptions>(GQL_LIEUX_OPTIONS).catch(() => ({} as GQLAllOptions)),
    { cacheKey: "gql-lieux-options", staleMs: 120_000, persist: true }
  );
}
