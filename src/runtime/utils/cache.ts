import { useState } from "#app";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export class CacheKeyBuilder<T extends Record<string, unknown> = {}> {
  private keys: string[] = [];
  private prefetch = new Map<
    string,
    (params: unknown) => Promise<void> | void
  >();

  getKeys(): string[] {
    return [...this.keys];
  }

  /**
   * Adds a new prefetch configuration to the cache key builder
   * @template K - The string literal type for the key
   * @template X - The type of parameters expected by the callback
   * @param key - The unique key for this prefetch configuration. Cannot be a key that already exists in T
   * @param callback - The function to execute when prefetching. Can be async or sync
   * @param defaultValue - Optional default value to initialize the state with
   * @returns A new CacheKeyBuilder instance with the updated type that includes the new key-value pair
   */
  addPrefetch<K extends string, X>(
    key: K extends keyof T ? never : K,
    callback: (params: X) => Promise<void> | void,
    defaultValue?: X
  ): CacheKeyBuilder<T & Record<K, X>> {
    this.keys.push(key);
    useState(key, () => defaultValue);
    this.prefetch.set(
      key,
      callback as (params: unknown) => Promise<void> | void
    );

    return this as CacheKeyBuilder<T & Record<K, X>>;
  }

  async triggerPrefetch<K extends keyof T>(key: K, params?: T[K]) {
    const callback = this.prefetch.get(key as string);
    if (callback) {
      return await callback(params);
    }
  }
}
