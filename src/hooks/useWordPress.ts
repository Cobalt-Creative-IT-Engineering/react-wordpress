import { useState, useEffect, useCallback } from "react";
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

type FetchState<T> =
  | { status: "idle"; data: T | null; error: null }
  | { status: "loading"; data: T | null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: T | null; error: string };

function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<FetchState<T>>({
    status: "loading",
    data: null,
    error: null,
  });

  const load = useCallback(async () => {
    setState((prev) => ({ status: "loading", data: prev.data, error: null }));
    try {
      const data = await fetcher();
      setState({ status: "success", data, error: null });
    } catch (e) {
      setState({ status: "error", data: null, error: (e as Error).message });
    }
  }, deps);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, refetch: load };
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
    [enabled, page, JSON.stringify(params)]
  );

  return {
    ...state,
    posts: state.status === "success" ? state.data.posts : [],
    total: state.status === "success" ? state.data.total : 0,
    totalPages: state.status === "success" ? state.data.totalPages : 0,
    page,
    setPage,
  };
}

export function usePost(slug: string) {
  return useFetch<WPPost | null>(() => (slug ? getPostBySlug(slug) : Promise.resolve(null)), [slug]);
}

export function usePage(slug: string) {
  return useFetch<WPPage | null>(() => (slug ? getPageBySlug(slug) : Promise.resolve(null)), [slug]);
}

export function useACFOptions() {
  return useFetch<ACFOptions>(() => getACFOptions(), []);
}

export function useACFPost(postId: number | null) {
  return useFetch<Record<string, unknown>>(
    () => (postId ? getACFForPost(postId) : Promise.resolve({})),
    [postId]
  );
}

export function useCPT<T extends Record<string, unknown>>(cptSlug: string, params: QueryParams = {}) {
  return useFetch<T[]>(() => (cptSlug ? getCPT<T>(cptSlug, params) : Promise.resolve([])), [
    cptSlug,
    JSON.stringify(params),
  ]);
}

export function useCategories() {
  return useFetch(() => getCategories(), []);
}

export function useTaxonomyTerms(taxonomy: string, params: QueryParams = {}) {
  return useFetch<WPTaxonomyTerm[]>(
    () => (taxonomy ? getTaxonomyTerms(taxonomy, params) : Promise.resolve([])),
    [taxonomy, JSON.stringify(params)]
  );
}
