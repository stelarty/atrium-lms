<template>
  <svg :width="size" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.1846 5.31592C23.0116 5.31592 28.6182 10.9214 28.6182 17.7485C28.6181 20.5791 27.6751 23.1326 26.1211 25.2417L28.0635 27.1841C28.7848 27.8501 28.7846 29.0152 28.0635 29.6812C27.3975 30.4027 26.2314 30.4027 25.5654 29.6812L23.6221 27.7388C21.513 29.2927 18.9595 30.1812 16.1846 30.1812V30.2368C13.3542 30.2366 10.8013 29.2927 8.69238 27.7388L6.75 29.6812C6.08397 30.4026 4.91803 30.4026 4.25195 29.6812C3.53074 29.0152 3.53069 27.8501 4.25195 27.1841L6.19434 25.2417C4.64031 23.1326 3.75203 20.5791 3.75195 17.7485C3.75195 10.9217 9.30231 5.31635 16.1846 5.31592ZM16.1846 10.6431C15.4079 10.6435 14.8535 11.2548 14.8535 11.9761V17.7485C14.8536 18.1367 14.965 18.469 15.2422 18.6909L17.9053 21.356C18.4048 21.9109 19.2379 21.9107 19.793 21.356C20.2923 20.8563 20.2924 20.0234 19.793 19.5239L17.5176 17.2485V11.9761C17.5176 11.2545 16.9061 10.6431 16.1846 10.6431ZM6.82812 1.76318C8.21564 1.76323 9.43733 2.31756 10.3809 3.20557L2.33105 9.92236C1.83157 9.08983 1.49902 8.08935 1.49902 7.09033C1.49951 4.14901 3.88668 1.76319 6.82812 1.76318ZM25.1738 1.76318C28.1151 1.76335 30.5014 4.14911 30.502 7.09033C30.502 8.0894 30.1694 9.0898 29.6699 9.92236L21.6221 3.20557C22.5655 2.31787 23.7867 1.7633 25.1738 1.76318Z"
      :fill="active ? `url(#${activeGradientId})` : `url(#${inactiveGradientId})`"
    />
    <defs>
      <linearGradient
        :id="activeGradientId"
        x1="16.0005"
        y1="1.76318"
        x2="16.0005"
        y2="30.2368"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#A6AEFF" />
        <stop offset="1" stop-color="#606FFF" />
      </linearGradient>
      <linearGradient
        :id="inactiveGradientId"
        x1="16.0005"
        y1="1.76318"
        x2="16.0005"
        y2="30.2368"
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

const { activeGradientId, inactiveGradientId } = useTabBarIconGradient('clock-tab-bar')

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
