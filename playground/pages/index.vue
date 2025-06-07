<script setup lang="ts">
const cache = new CacheKeyBuilder()
  .addPrefetch("test", () => {
    const randomInt = Math.max(Math.floor(Math.random() * 100), 1);
    return $fetch(`https://jsonplaceholder.typicode.com/posts/${randomInt}`);
  })
  .addPrefetch("testTwo", () => {
    const randomInt = Math.max(Math.floor(Math.random() * 100), 1);
    return $fetch(`https://jsonplaceholder.typicode.com/posts/${randomInt}`);
  })
  .addPrefetch("testThree", () => {
    const randomInt = Math.max(Math.floor(Math.random() * 100), 1);
    return $fetch(`https://jsonplaceholder.typicode.com/posts/${randomInt}`);
  });

const testElOne = useTemplateRef("testElOne");
const testElTwo = useTemplateRef("testElTwo");
const testElThree = useTemplateRef("testElThree");

const { states } = useForesight({
  cache,
  track: [
    {
      key: "test",
      el: testElOne,
    },
    {
      key: "testTwo",
      el: testElTwo,
    },
    {
      key: "testThree",
      el: testElThree,
    },
  ],
});
</script>

<template>
  <div style="display: flex; gap: 200px; flex-direction: column">
    {{ states }}
    <div ref="testElOne" style="outline: 1px solid red">
      {{ states.test ?? "No value for test" }}
    </div>
    <div ref="testElTwo" style="outline: 1px solid blue">
      {{ states.testTwo ?? "No value for testTwo" }}
    </div>
    <div ref="testElThree" style="outline: 1px solid green">
      {{ states.testThree ?? "No value for testThree" }}
    </div>
  </div>
</template>
