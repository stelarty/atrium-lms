<!-- src/components/ui/empty/EmptyDevelopment.vue -->
<template>
  <EmptyState
    :title="title || 'Функционал в разработке'"
    :subtitle="subtitle || 'Следите за новостями'"
    variant="centered"
  >
    <template #icon>
      <slot name="icon">
        <img class="empty-development__image" :src="imageSrc || inDevImage" :alt="imageAlt" />
      </slot>
    </template>
    <template #title><slot name="title" /></template>
    <template #subtitle><slot name="subtitle" /></template>
    <template #actions><slot name="actions" /></template>
  </EmptyState>
</template>

<script setup lang="ts">
import inDevImage from '@/assets/images/in-dev.png'
import EmptyState from '../EmptyState.vue'

withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    imageSrc?: string
    imageAlt?: string
  }>(),
  {
    title: '',
    subtitle: '',
    imageSrc: '',
    imageAlt: 'Функционал в разработке',
  },
)
</script>

<style scoped lang="scss">
.empty-development__image {
  width: 96px;
  height: 96px;
  object-fit: contain;

  @include screen-min('md') {
    width: 120px;
    height: 120px;
  }
}
</style>
