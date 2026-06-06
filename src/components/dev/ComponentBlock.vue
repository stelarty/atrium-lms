<!-- components/dev/ComponentBlock.vue -->
<template>
  <div class="component-block">
    <h2>{{ title }}</h2>
    <div class="component-block__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style lang="scss" scoped>
.component {
  &-block {
    display: flex;
    flex-direction: column;
    gap: $m6;

    &__content {
      display: flex;
      gap: $m8;
    }
  }
}
</style>
