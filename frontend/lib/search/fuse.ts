import Fuse, { type FuseOptionKey, type IFuseOptions } from "fuse.js";
import { useMemo } from "react";

export const DEFAULT_FUSE_OPTIONS = {
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 1,
} as const satisfies Partial<IFuseOptions<unknown>>;

export function fuseSearch<T>(
  items: readonly T[],
  query: string,
  keys: FuseOptionKey<T>[],
  options?: Partial<IFuseOptions<T>>,
): T[] {
  const trimmed = query.trim();
  if (!trimmed || items.length === 0) {
    return [...items];
  }

  const fuse = new Fuse([...items], {
    keys,
    ...DEFAULT_FUSE_OPTIONS,
    ...options,
  });

  return fuse.search(trimmed).map((result) => result.item);
}

export function useFuseSearch<T>(
  items: readonly T[],
  query: string,
  keys: readonly FuseOptionKey<T>[],
  options?: Partial<IFuseOptions<T>>,
): T[] {
  return useMemo(
    () => fuseSearch(items, query, keys as FuseOptionKey<T>[], options),
    [items, query, keys, options],
  );
}
