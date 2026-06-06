<template>
  <div class="base-mark">
    <slot>{{ text }}</slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** Plain text when slot is not used */
  text?: string
}>()
</script>

<style scoped lang="scss">
@import '@/styles/components/_base-mark';
</style>
