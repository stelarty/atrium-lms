<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 8C6.53125 8 5.34375 6.8125 5.34375 5.34375C5.34375 3.875 6.53125 2.65625 8 2.65625C9.46875 2.65625 10.6562 3.875 10.6562 5.34375C10.6562 6.8125 9.46875 8 8 8ZM8 9.34375C9.78125 9.34375 13.3438 10.2188 13.3438 12V12.6562C13.3438 13.0312 13.0312 13.3438 12.6562 13.3438H3.34375C2.96875 13.3438 2.65625 13.0312 2.65625 12.6562V12C2.65625 10.2188 6.21875 9.34375 8 9.34375Z"
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
