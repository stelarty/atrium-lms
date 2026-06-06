<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.80666 7.80667L7.53333 9.53334C7.79333 9.79334 8.21333 9.79334 8.47333 9.53334L10.2 7.80667C10.62 7.38667 10.32 6.66667 9.72666 6.66667H6.27333C5.67999 6.66667 5.38666 7.38667 5.80666 7.80667Z"
      :fill="color"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: string | number
    color?: string
  }>(),
  {
    size: 16,
    color: '#7E8088',
  },
)
</script>
