import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    globals: true,
    include: ["test/**/*.test.ts", "test/**/*.nuxt.test.ts"],
  },
});
