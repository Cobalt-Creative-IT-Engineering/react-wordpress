import { useState, useEffect, useCallback } from "react";
import {
  getPosts,
  getPostBySlug,
  getPageBySlug,
  getACFOptions,
  getACFForPost,
  getCPT,
  getCategories,
  type WPPost,
  type WPPage,
  type ACFOptions,
  type QueryParams,
} from "../lib/wordpress";

// ─── Generic fetch hook ────────────────────────────────────────────────

type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<FetchState<T>>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const data = await fetcher();
      setState({ status: "success", data });
    } catch (e) {
      setState({ status: "error", error: (e as Error).message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);

  return { ...state, refetch: load };
}

// ─── Posts ─────────────────────────────────────────────────────────────

export interface UsePostsOptions extends QueryParams {
  enabled?: boolean;
}

export function usePosts(options: UsePostsOptions = {}) {
  const { enabled = true, ...params } = options;
  const [page, setPage] = useState(params.page ?? 1);

  const state = useFetch(
    () => (enabled ? getPosts({ ...params, page }) : Promise.resolve({ posts: [], total: 0, totalPages: 0 })),
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
  return useFetch<WPPost | null>(
    () => (slug ? getPostBySlug(slug) : Promise.resolve(null)),
    [slug]
  );
}

// ─── Pages ─────────────────────────────────────────────────────────────

export function usePage(slug: string) {
  return useFetch<WPPage | null>(
    () => (slug ? getPageBySlug(slug) : Promise.resolve(null)),
    [slug]
  );
}

// ─── ACF ───────────────────────────────────────────────────────────────

export function useACFOptions() {
  return useFetch<ACFOptions>(() => getACFOptions(), []);
}

export function useACFPost(postId: number | null) {
  return useFetch<Record<string, unknown>>(
    () => (postId ? getACFForPost(postId) : Promise.resolve({})),
    [postId]
  );
}

// ─── Custom Post Types ─────────────────────────────────────────────────

export function useCPT<T extends Record<string, unknown>>(
  cptSlug: string,
  params: QueryParams = {}
) {
  return useFetch<T[]>(
    () => (cptSlug ? getCPT<T>(cptSlug, params) : Promise.resolve([])),
    [cptSlug, JSON.stringify(params)]
  );
}

// ─── Categories ────────────────────────────────────────────────────────

export function useCategories() {
  return useFetch(() => getCategories(), []);
}
