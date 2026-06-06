<!-- src/components/ui/empty/EmptyNoResults.vue -->
<template>
  <EmptyState
    iconName="searchBig"
    :title="title || 'Результатов не найдено'"
    :subtitle="subtitle"
  >
    <template #icon><slot name="icon" /></template>
    <template #title><slot name="title" /></template>
    <template #subtitle><slot name="subtitle" /></template>
    <template #actions><slot name="actions" /></template>
  </EmptyState>
</template>

<script setup lang="ts">
import EmptyState from '../EmptyState.vue'

defineProps<{
  title?: string
  subtitle?: string
}>()
</script>