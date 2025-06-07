<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: My Module
- Package name: my-module
- Description: My new Nuxt module
-->

# Nuxt Foresight

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Intelligent predictive prefetching for Nuxt applications. Foresight tracks mouse movement and velocity to predict user interactions and prefetch data just before it's needed.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
  <!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/nuxt-foresight?file=playground%2Fapp.vue) -->
  <!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Inspiration

This module is heavily inspired by [ForesightJS](https://github.com/spaansba/ForesightJS) - a lightweight JavaScript library that predicts user intent based on mouse movements and keyboard navigation. Nuxt Foresight adapts these concepts specifically for Nuxt applications with server-side rendering support and Nuxt-specific optimizations.

## Features

- 🎯 &nbsp;**Predictive Prefetching** - Uses mouse velocity and trajectory to predict user interactions
- 🎛️ &nbsp;**Configurable Radius** - Set the distance threshold for triggering prefetches
- ⚡ &nbsp;**Performance Optimized** - Debounced tracking with smart caching to avoid duplicate requests
- 🧩 &nbsp;**Type-Safe** - Full TypeScript support with strongly typed cache keys and values
- 🎨 &nbsp;**Framework Agnostic** - Works with any data fetching pattern or API layer

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add nuxt-foresight
```

That's it! You can now use Nuxt Foresight in your Nuxt app ✨

## Configuration

Add the module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ["nuxt-foresight"],
  foresight: {
    radius: 150, // Distance in pixels to trigger prefetch (default: 100)
  },
});
```

## Usage

### Basic Example

```vue
<template>
  <div>
    <button
      v-for="item in items"
      :key="item.id"
      :ref="(el) => buttonRefs.set(item.id, el)"
      @click="navigateTo(`/item/${item.id}`)"
    >
      {{ item.title }}
    </button>
  </div>
</template>

<script setup>
import { CacheKeyBuilder } from "nuxt-foresight/runtime/utils/cache";

const items = [
  { id: 1, title: "Item 1" },
  { id: 2, title: "Item 2" },
  { id: 3, title: "Item 3" },
];

const buttonRefs = new Map();

// Create cache builder with prefetch configurations
const cache = new CacheKeyBuilder()
  .addPrefetch("item-1", async () => {
    // Prefetch item 1 data
    await $fetch("/api/items/1");
  })
  .addPrefetch("item-2", async () => {
    // Prefetch item 2 data
    await $fetch("/api/items/2");
  })
  .addPrefetch("item-3", async () => {
    // Prefetch item 3 data
    await $fetch("/api/items/3");
  });

// Track elements for predictive prefetching
const { states } = useForesight({
  cache,
  track: [
    { key: "item-1", el: computed(() => buttonRefs.get(1)) },
    { key: "item-2", el: computed(() => buttonRefs.get(2)) },
    { key: "item-3", el: computed(() => buttonRefs.get(3)) },
  ],
});
</script>
```

### Advanced Example with Dynamic Data

```vue
<template>
  <div>
    <article
      v-for="post in posts"
      :key="post.id"
      :ref="(el) => articleRefs.set(post.id, el)"
      class="post-preview"
    >
      <h2>{{ post.title }}</h2>
      <p>{{ post.excerpt }}</p>
      <NuxtLink :to="`/posts/${post.id}`">Read more</NuxtLink>
    </article>
  </div>
</template>

<script setup>
const { data: posts } = await $fetch("/api/posts");
const articleRefs = new Map();

// Build cache with dynamic prefetch functions
const cache = posts.reduce((builder, post) => {
  return builder.addPrefetch(`post-${post.id}`, async () => {
    // Prefetch full post content and related data
    await Promise.all([
      $fetch(`/api/posts/${post.id}`),
      $fetch(`/api/posts/${post.id}/comments`),
      $fetch(`/api/posts/${post.id}/related`),
    ]);
  });
}, new CacheKeyBuilder());

// Track all post elements
const { states } = useForesight({
  cache,
  track: posts.map((post) => ({
    key: `post-${post.id}`,
    el: computed(() => articleRefs.get(post.id)),
  })),
});
</script>
```

## API Reference

### `useForesight(options)`

The main composable for predictive prefetching.

**Parameters:**

- `cache`: `CacheKeyBuilder` - Instance containing prefetch configurations
- `track`: Array of objects with:
  - `key`: Cache key to associate with the element
  - `el`: Reactive reference to the DOM element to track

**Returns:**

- `states`: Reactive object containing the state for each cache key

### `CacheKeyBuilder`

Utility class for building type-safe cache configurations.

**Methods:**

- `addPrefetch<K, X>(key, callback, defaultValue?)`: Adds a prefetch configuration
  - `key`: Unique string key (must not conflict with existing keys)
  - `callback`: Function to execute when prefetching (sync or async)
  - `defaultValue`: Optional initial value for the state
- `getKeys()`: Returns array of all registered keys
- `triggerPrefetch(key, params?)`: Manually trigger prefetch for a specific key

## How It Works

1. **Mouse Tracking**: Foresight continuously tracks mouse position and calculates velocity
2. **Trajectory Prediction**: Uses velocity to extrapolate where the mouse is heading
3. **Proximity Detection**: Checks if predicted position is within the configured radius of tracked elements
4. **Smart Prefetching**: Triggers prefetch functions only once per element, with debouncing to avoid excessive calls
5. **State Management**: Stores prefetched data in Nuxt's state management system for instant access

## Testing

This module follows the [official Nuxt module testing guidelines](https://nuxt.com/docs/guide/going-further/modules#testing) using fixtures and `@nuxt/test-utils`:

```bash
# Run all tests
nr test

# Run tests in watch mode
nr test:watch

# Run type checking
nr test:types
```

### Test Structure

The testing approach uses **fixtures** as recommended by the Nuxt team:

- **`test/fixtures/basic/`**: Basic functionality testing with interactive elements
- **`test/fixtures/ssr/`**: SSR-specific testing to ensure server-side compatibility
- **`test/basic.test.ts`**: End-to-end tests using the basic fixture
- **`test/ssr.test.ts`**: SSR-specific tests using the SSR fixture
- **`test/unit.test.ts`**: Unit tests for utilities that don't require Nuxt context

Each test follows the recommended workflow:

1. Create a Nuxt application fixture in `test/fixtures/*`
2. Setup Nuxt with the fixture using `setup()` from `@nuxt/test-utils/e2e`
3. Interact with the fixture using `$fetch()` and other utilities
4. Perform checks against the rendered output

## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  ni
  
  # Generate type stubs
  nr dev:prepare
  
  # Develop with the playground
  nr dev
  
  # Build the playground
  nr dev:build
  
  # Run ESLint
  nr lint
  
  # Run all tests
  nr test
  nr test:watch
  
  # Release new version
  nr release
  ```

</details>

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-foresight/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-foresight
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-foresight.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-foresight
[license-src]: https://img.shields.io/npm/l/nuxt-foresight.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-foresight
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
