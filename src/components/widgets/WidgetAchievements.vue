<!-- src/components/widgets/WidgetAchievements.vue -->
<template>
  <div class="widget-achievements">
    <h2 class="widget-achievements__heading">Ачивки</h2>

    <Transition name="slide" mode="out-in" :duration="{ enter: 300, leave: 300 }">
      <div v-if="isLoading" class="widget-achievements__grid">
        <article v-for="item in 3" :key="item" class="widget-achievements__card widget-achievements__card--skeleton">
          <Skeleton type="rect" width="158px" height="158px" radius="32px" animated variant="light" />
          <Skeleton type="text" animated variant="light" />
          <Skeleton type="text" size="full" animated variant="light" />
        </article>
      </div>

      <div v-else class="widget-achievements__grid">
        <article v-for="item in achievements" :key="item.image_url" class="widget-achievements__card" :class="{
          'widget-achievements__card--no-received': !item.is_received,
        }">
          <img :src="item.image_url" alt="Ачивка" class="widget-achievements__image" />
          <h3 class="widget-achievements__title">{{ item.title }}</h3>
          <p class="widget-achievements__desc">{{ item.description }}</p>
        </article>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Achievement } from '@/api/types/profile'
import Skeleton from '@/components/ui/Skeleton.vue'

withDefaults(
  defineProps<{
    achievements: Achievement[]
    isLoading?: boolean
  }>(),
  {
    isLoading: false,
  },
)
</script>

<style scoped lang="scss">
@import '@/styles/components/_widget-achievements';
</style>