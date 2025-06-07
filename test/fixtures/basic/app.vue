<template>
  <div>
    <h1>Nuxt Foresight Test</h1>
    <div class="buttons">
      <button
        v-for="item in items"
        :key="item.id"
        :ref="(el) => buttonRefs.set(item.id, el)"
        class="test-button"
        @click="handleClick(item.id)"
      >
        {{ item.title }}
      </button>
    </div>
    <div class="status">Module loaded successfully</div>
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
    await new Promise((resolve) => setTimeout(resolve, 100));
    return "data-1";
  })
  .addPrefetch("item-2", async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return "data-2";
  })
  .addPrefetch("item-3", async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return "data-3";
  });

// Track elements for predictive prefetching
const { states: _states } = useForesight({
  cache,
  track: [
    { key: "item-1", el: computed(() => buttonRefs.get(1)) },
    { key: "item-2", el: computed(() => buttonRefs.get(2)) },
    { key: "item-3", el: computed(() => buttonRefs.get(3)) },
  ],
});

function handleClick(id) {
  console.log(`Clicked item ${id}`);
}
</script>

<style scoped>
.buttons {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
}

.test-button {
  padding: 0.5rem 1rem;
  background: #00dc82;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.status {
  color: #00dc82;
  font-weight: bold;
}
</style>
