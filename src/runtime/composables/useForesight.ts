import { useRuntimeConfig, useState } from "#app";
import { computed, ref } from "#imports";
import { useMouse, watchDebounced } from "@vueuse/core";
import type { ShallowRef } from "vue";
import type { CacheKeyBuilder } from "../utils/cache";

export const useForesight = <T extends Record<string, unknown>>({
  cache,
  track = [],
}: {
  cache: CacheKeyBuilder<T>;
  track: {
    key: keyof T;
    el: Readonly<ShallowRef<HTMLElement | null>>;
  }[];
}) => {
  const { radius } = useRuntimeConfig().public.foresight as { radius: number };
  const fetchedKeys = new Map<keyof T, boolean>();

  const keysInCache: (keyof T)[] = cache.getKeys();
  const states = useState(
    () =>
      Object.fromEntries(keysInCache.map((key) => [key])) as Record<
        keyof T,
        unknown | undefined
      >
  );

  for (const key of keysInCache) {
    states.value[key] = useState(key.toString() as string);
  }

  const { x, y } = useMouse();

  // Track previous mouse position for velocity calculation
  const prevX = ref(x.value);
  const prevY = ref(y.value);
  const mouseVelocity = computed(() => {
    if (x.value === undefined || y.value === undefined) return { vx: 0, vy: 0 };
    const vx = x.value - (prevX.value ?? x.value);
    const vy = y.value - (prevY.value ?? y.value);

    // Update previous position for next calculation
    prevX.value = x.value;
    prevY.value = y.value;

    return { vx, vy };
  });

  // Use radius as prediction time multiplier (radius/100 = time factor)
  const predictionFactor = radius / 100;
  const extrapolatedMousePosition = computed(() => {
    if (x.value === undefined || y.value === undefined)
      return { x: x.value ?? 0, y: y.value ?? 0 };
    const velocity = mouseVelocity.value;

    return {
      x: x.value + velocity.vx * predictionFactor,
      y: y.value + velocity.vy * predictionFactor,
    };
  });

  const elementsInRadius = computed(() => {
    // If no elements are tracked, return an empty array
    if (track.length === 0) return [];
    // If the mouse is not defined, return an empty array
    if (x.value === undefined || y.value === undefined) return [];
    // If the mouse is at the origin, return an empty array
    if (x.value === 0 && y.value === 0) return [];
    // If the client is not defined, return an empty array
    // Elements are only tracked on the client side
    if (!import.meta.client) return [];

    const elementsWithinRadius: Array<{ key: keyof T; distance: number }> = [];
    const predictedMouse = extrapolatedMousePosition.value;

    for (const item of track) {
      if (!item.el.value) continue;

      // Get element's position relative to viewport
      const rect = item.el.value.getBoundingClientRect();

      // Find the closest point on the element to the predicted mouse position
      const closestX = Math.max(
        rect.left,
        Math.min(predictedMouse.x, rect.right)
      );
      const closestY = Math.max(
        rect.top,
        Math.min(predictedMouse.y, rect.bottom)
      );

      // Calculate distance from predicted mouse position to closest point on element
      const distance = Math.sqrt(
        (predictedMouse.x - closestX) ** 2 + (predictedMouse.y - closestY) ** 2
      );

      if (distance < radius) {
        elementsWithinRadius.push({ key: item.key, distance });
      }
    }

    return elementsWithinRadius;
  });

  watchDebounced(
    elementsInRadius,
    async (elements) => {
      if (import.meta.client && elements.length > 0) {
        for (const element of elements) {
          if (!fetchedKeys.get(element.key)) {
            states.value[element.key] = await cache.triggerPrefetch(
              element.key
            );
            fetchedKeys.set(element.key, true);
          }
        }
      }
    },
    {
      debounce: 100,
    }
  );

  return {
    states,
  };
};
