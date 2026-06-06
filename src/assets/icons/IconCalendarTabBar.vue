<template>
  <svg :width="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21.1875 20.5312C21.1875 21.6387 20.2852 22.5 19.2188 22.5H4.78125C3.67383 22.5 2.8125 21.6387 2.8125 20.5312V9.375H21.1875V20.5312ZM7.73438 16.5938C7.16016 16.5938 6.75 17.0449 6.75 17.5781C6.75 18.1523 7.16016 18.5625 7.73438 18.5625H12.3281C12.8613 18.5625 13.3125 18.1523 13.3125 17.5781C13.3125 17.0449 12.8613 16.5938 12.3281 16.5938H7.73438ZM7.73438 12.6562C7.16016 12.6562 6.75 13.1074 6.75 13.6406C6.75 14.2148 7.16016 14.625 7.73438 14.625H16.2656C16.7988 14.625 17.25 14.2148 17.25 13.6406C17.25 13.1074 16.7988 12.6562 16.2656 12.6562H7.73438ZM15.9375 1.5C16.6348 1.5 17.25 2.11523 17.25 2.8125V4.125H19.2188C20.2852 4.125 21.1875 5.02734 21.1875 6.09375V8.0625H2.8125V6.09375C2.8125 5.02734 3.67383 4.125 4.78125 4.125H6.75V2.8125C6.75 2.11523 7.32422 1.5 8.0625 1.5C8.75977 1.5 9.375 2.11523 9.375 2.8125V4.125H14.625V2.8125C14.625 2.11523 15.1992 1.5 15.9375 1.5Z"
      :fill="active ? `url(#${activeGradientId})` : `url(#${inactiveGradientId})`"
    />
    <defs>
      <linearGradient
        :id="activeGradientId"
        x1="12"
        y1="1.5"
        x2="12"
        y2="22.5"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#A6AEFF" />
        <stop offset="1" stop-color="#606FFF" />
      </linearGradient>
      <linearGradient
        :id="inactiveGradientId"
        x1="12"
        y1="1.5"
        x2="12"
        y2="22.5"
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

const { activeGradientId, inactiveGradientId } = useTabBarIconGradient('calendar-tab-bar')

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
