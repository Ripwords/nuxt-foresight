import { defineNuxtModule, createResolver, addImports } from "@nuxt/kit";
import { defu } from "defu";

export interface ModuleOptions {
  radius?: number;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-foresight",
    configKey: "foresight",
  },
  defaults: {
    radius: 50,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    nuxt.options.runtimeConfig.public.foresight = defu(
      nuxt.options.runtimeConfig.public.foresight as Record<string, unknown>,
      {
        radius: options.radius,
      }
    );

    addImports({
      name: "useForesight",
      as: "useForesight",
      from: resolver.resolve("./runtime/composables/useForesight"),
    });

    addImports({
      name: "CacheKeyBuilder",
      as: "CacheKeyBuilder",
      from: resolver.resolve("./runtime/utils/cache"),
    });
  },
});
