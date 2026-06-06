<!-- src/components/widgets/WidgetSectionCard.vue -->
<template>
  <div class="widget-section-card" :class="{ 'widget-section-card--bordered': bordered }">
    <header v-if="title || description" class="widget-section-card__header">
      <div class="widget-section-card__header-top">
        <h3 class="widget-section-card__title">{{ title }}</h3>
        <slot name="action" />
      </div>
      <p v-if="description" class="widget-section-card__description">{{ description }}</p>
    </header>

    <div class="widget-section-card__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** Заголовок карточки */
  title?: string
  /** Описание под заголовком */
  description?: string
  bordered?: boolean
}>()
</script>

<style scoped lang="scss">
@import '@/styles/components/_widget-section-card';
</style>
