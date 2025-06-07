import { describe, it, expect, vi } from "vitest";

describe("unit tests", () => {
  it("should be able to import CacheKeyBuilder", async () => {
    const { CacheKeyBuilder } = await import("../src/runtime/utils/cache");

    expect(CacheKeyBuilder).toBeDefined();
    expect(typeof CacheKeyBuilder).toBe("function");
  });

  it("CacheKeyBuilder should work without Nuxt context", async () => {
    const { CacheKeyBuilder } = await import("../src/runtime/utils/cache");
    const cache = new CacheKeyBuilder();

    expect(cache.getKeys()).toEqual([]);
  });

  it("should handle basic prefetch configuration", async () => {
    const { CacheKeyBuilder } = await import("../src/runtime/utils/cache");
    const mockCallback = vi.fn();
    const cache = new CacheKeyBuilder();

    const updatedCache = cache.addPrefetch("test-key", mockCallback);

    expect(updatedCache.getKeys()).toContain("test-key");
  });
});
