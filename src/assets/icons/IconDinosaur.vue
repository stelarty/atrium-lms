<template>
  <svg :width="size" viewBox="0 0 97 84" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- neck (thick stroke connects head to body seamlessly) -->
    <path d="M22 18 C15 34 21 44 36 48" :stroke="color" stroke-width="15" stroke-linecap="round"/>
    <!-- head -->
    <circle cx="21" cy="10" r="10" :fill="color"/>
    <!-- body -->
    <ellipse cx="58" cy="53" rx="29" ry="21" :fill="color"/>
    <!-- front legs -->
    <rect x="36" y="70" width="10" height="13" rx="5" :fill="color"/>
    <rect x="49" y="70" width="10" height="13" rx="5" :fill="color"/>
    <!-- back legs -->
    <rect x="63" y="70" width="10" height="13" rx="5" :fill="color"/>
    <rect x="76" y="70" width="10" height="13" rx="5" :fill="color"/>
    <!-- tail -->
    <path d="M85 54 C92 48 97 40 93 34" :stroke="color" stroke-width="10" stroke-linecap="round"/>
    <!-- eye -->
    <circle cx="17" cy="8" r="2.5" fill="white"/>
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: string | number
    color?: string
  }>(),
  {
    size: 97,
    color: '#DBDCDF',
  },
)
</script>
