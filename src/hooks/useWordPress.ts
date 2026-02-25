import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getPosts,
  getPostBySlug,
  getPageBySlug,
  getACFOptions,
  getACFForPost,
  getCPT,
  getCategories,
  getTaxonomyTerms,
  type WPPost,
  type WPPage,
  type ACFOptions,
  type QueryParams,
  type WPTaxonomyTerm,
} from "../lib/wordpress";

type FetchState<T> = {
  status: "idle" | "loading" | "success" | "error";
  data: T | null;
  error: string | null;
  isFetching: boolean;
};

const memoryCache = new Map<string, { data: unknown; updatedAt: number }>();
const DEFAULT_STALE_MS = 60_000;

function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: { cacheKey?: string; staleMs?: number } = {}
) {
  const cacheKey = options.cacheKey;
  const staleMs = options.staleMs ?? DEFAULT_STALE_MS;

  const initialCached = useMemo(() => {
    if (!cacheKey) return null;
    const cached = memoryCache.get(cacheKey);
    return cached ? (cached.data as T) : null;
  }, [cacheKey]);

  const [state, setState] = useState<FetchState<T>>({
    status: initialCached ? "success" : "loading",
    data: initialCached,
    error: null,
    isFetching: !initialCached,
  });

  const load = useCallback(
    async (force = false) => {
      const now = Date.now();
      if (!force && cacheKey) {
        const cached = memoryCache.get(cacheKey);
        if (cached && now - cached.updatedAt < staleMs) {
          setState({
            status: "success",
            data: cached.data as T,
            error: null,
            isFetching: false,
          });
          return;
        }
      }

      setState((prev) => ({
        status: prev.data ? "success" : "loading",
        data: prev.data,
        error: null,
        isFetching: true,
      }));

      try {
        const data = await fetcher();
        if (cacheKey) {
          memoryCache.set(cacheKey, { data, updatedAt: Date.now() });
        }
        setState({ status: "success", data, error: null, isFetching: false });
      } catch (e) {
        setState((prev) => ({
          status: prev.data ? "success" : "error",
          data: prev.data,
          error: prev.data ? null : (e as Error).message,
          isFetching: false,
        }));
      }
    },
    [cacheKey, fetcher, staleMs]
  );

  useEffect(() => {
    void load();
  }, [load, ...deps]);

  return { ...state, refetch: () => load(true) };
}

export interface UsePostsOptions extends QueryParams {
  enabled?: boolean;
}

export function usePosts(options: UsePostsOptions = {}) {
  const { enabled = true, ...params } = options;
  const [page, setPage] = useState(params.page ?? 1);

  const state = useFetch(
    () =>
      enabled
        ? getPosts({ ...params, page })
        : Promise.resolve({ posts: [], total: 0, totalPages: 0 }),
    [enabled, page, JSON.stringify(params)],
    { cacheKey: `posts:${JSON.stringify({ ...params, page, enabled })}` }
  );

  return {
    ...state,
    posts: state.data?.posts ?? [],
    total: state.data?.total ?? 0,
    totalPages: state.data?.totalPages ?? 0,
    page,
    setPage,
  };
}

export function usePost(slug: string) {
  return useFetch<WPPost | null>(
    () => (slug ? getPostBySlug(slug) : Promise.resolve(null)),
    [slug],
    { cacheKey: `post:${slug}` }
  );
}

export function usePage(slug: string) {
  return useFetch<WPPage | null>(
    () => (slug ? getPageBySlug(slug) : Promise.resolve(null)),
    [slug],
    { cacheKey: `page:${slug}` }
  );
}

export function useACFOptions() {
  return useFetch<ACFOptions>(() => getACFOptions(), [], { cacheKey: "acf-options", staleMs: 120_000 });
}

export function useACFPost(postId: number | null) {
  return useFetch<Record<string, unknown>>(
    () => (postId ? getACFForPost(postId) : Promise.resolve({})),
    [postId],
    { cacheKey: `acf-post:${postId ?? "none"}` }
  );
}

export function useCPT<T extends Record<string, unknown>>(cptSlug: string, params: QueryParams = {}) {
  const paramsKey = JSON.stringify(params);
  return useFetch<T[]>(
    () => (cptSlug ? getCPT<T>(cptSlug, params) : Promise.resolve([])),
    [cptSlug, paramsKey],
    { cacheKey: `cpt:${cptSlug}:${paramsKey}` }
  );
}

export function useCategories() {
  return useFetch(() => getCategories(), [], { cacheKey: "categories" });
}

export function useTaxonomyTerms(taxonomy: string, params: QueryParams = {}) {
  const paramsKey = JSON.stringify(params);
  return useFetch<WPTaxonomyTerm[]>(
    () => (taxonomy ? getTaxonomyTerms(taxonomy, params) : Promise.resolve([])),
    [taxonomy, paramsKey],
    { cacheKey: `taxonomy:${taxonomy}:${paramsKey}` }
  );
}
