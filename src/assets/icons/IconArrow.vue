<template>
  <svg
    :class="['app-icon', `app-icon--${direction}`]"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.1875 4.46875C6.46875 4.21875 6.875 4.21875 7.125 4.46875L10.1875 7.53125C10.4687 7.78125 10.4687 8.21875 10.1875 8.46875L7.125 11.5312C6.875 11.7812 6.46875 11.7812 6.1875 11.5312C5.9375 11.2812 5.9375 10.8437 6.1875 10.5937L8.78125 8L6.1875 5.40625C5.9375 5.15625 5.9375 4.71875 6.1875 4.46875Z"
      :fill="color"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: string | number
    color?: string
    direction?: 'up' | 'down' | 'left' | 'right'
  }>(),
  {
    size: 16,
    color: '#7E8088',
     direction: 'right',
  },
)
</script>

<style scoped>
.app-icon {
  display: inline-block;
  vertical-align: middle;
  transition: transform 0.3s ease;
}

/* направления */
.app-icon--left {
  transform: rotate(180deg);
}
.app-icon--up {
  transform: rotate(-90deg);
}
.app-icon--down {
  transform: rotate(90deg);
}
.app-icon--right {
  transform: rotate(0deg);
}
</style>
