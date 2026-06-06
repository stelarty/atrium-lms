<!-- src/components/ui/empty/EmptyCreateFirst.vue -->
<template>
    <EmptyState
      iconName="new"
      :title="title || 'Пока ничего нет'"
      :subtitle="subtitle"
    >
      <!-- Прозрачно пробрасываем все слоты в базовый компонент -->
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