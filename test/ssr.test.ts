import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { setup, $fetch } from "@nuxt/test-utils/e2e";

describe("ssr", async () => {
  await setup({
    rootDir: resolve(process.cwd(), "test/fixtures/ssr"),
  });

  it("renders the index page", async () => {
    const html = await $fetch("/");

    expect(html).toContain("<h1>SSR Test</h1>");
  });

  it("works in SSR mode", async () => {
    const html = await $fetch("/");

    expect(html).toContain("Module working in SSR mode");
  });

  it("includes Nuxt hydration", async () => {
    const html = await $fetch("/");

    expect(html).toContain('<div id="__nuxt">');
  });
});
