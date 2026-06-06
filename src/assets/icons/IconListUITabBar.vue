<template>
  <svg :width="size" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M28.25 27.375C28.25 28.8516 27.0469 30 25.625 30H6.375C4.89844 30 3.75 28.8516 3.75 27.375V12.5H28.25V27.375ZM10.3125 22.125C9.54688 22.125 9 22.7266 9 23.4375C9 24.2031 9.54688 24.75 10.3125 24.75H16.4375C17.1484 24.75 17.75 24.2031 17.75 23.4375C17.75 22.7266 17.1484 22.125 16.4375 22.125H10.3125ZM10.3125 16.875C9.54688 16.875 9 17.4766 9 18.1875C9 18.9531 9.54688 19.5 10.3125 19.5H21.6875C22.3984 19.5 23 18.9531 23 18.1875C23 17.4766 22.3984 16.875 21.6875 16.875H10.3125ZM21.25 2C22.1797 2 23 2.82031 23 3.75V5.5H25.625C27.0469 5.5 28.25 6.70312 28.25 8.125V10.75H3.75V8.125C3.75 6.70312 4.89844 5.5 6.375 5.5H9V3.75C9 2.82031 9.76562 2 10.75 2C11.6797 2 12.5 2.82031 12.5 3.75V5.5H19.5V3.75C19.5 2.82031 20.2656 2 21.25 2Z"
      :fill="active ? `url(#${activeGradientId})` : `url(#${inactiveGradientId})`"
    />
    <defs>
      <linearGradient
        :id="activeGradientId"
        x1="16"
        y1="2"
        x2="16"
        y2="30"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#A6AEFF" />
        <stop offset="1" stop-color="#606FFF" />
      </linearGradient>
      <linearGradient
        :id="inactiveGradientId"
        x1="16"
        y1="2"
        x2="16"
        y2="30"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#C2C2C2" stop-opacity="0.45" />
        <stop offset="1" stop-color="#5C5C5C" stop-opacity="0.297" />
      </linearGradient>
    </defs>
  </svg>
</template>

<script setup lang="ts">
import { useTabBarIconGradient } from './useTabBarIconGradient'

const { activeGradientId, inactiveGradientId } = useTabBarIconGradient('list-ui-tab-bar')

withDefaults(
  defineProps<{
    size?: string | number
    active?: boolean
  }>(),
  {
    size: 16,
    active: false,
  },
)
</script>
