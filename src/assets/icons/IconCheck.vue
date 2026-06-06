<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 13 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.98885 9.98882L0.32218 6.32215C-0.107375 5.8926 -0.107374 5.19615 0.322181 4.76659C0.751736 4.33704 1.44818 4.33704 1.87774 4.76659L3.98885 6.87771L10.5444 0.322149C10.974 -0.107405 11.6704 -0.107404 12.1 0.32215C12.5295 0.751705 12.5295 1.44815 12.1 1.87771L3.98885 9.98882Z"
      :fill="color"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: string | number
    color?: string
    fill?: string
  }>(),
  {
    size: 12,
    color: '#fff',
    fill: '#fff',
  },
)
</script>
