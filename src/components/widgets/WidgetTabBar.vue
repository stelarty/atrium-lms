<!-- src/components/widgets/WidgetTabBar.vue -->
<template>
  <nav class="widget-tab-bar" role="navigation">
    <ul class="widget-tab-bar__list" role="tablist">
      <BaseTab v-for="item in items" :key="item.id" :id="item.id" :label="item.label" :icon="item.icon"
        :active="modelValue?.id === item.id" @select="handleSelect(item)" />
    </ul>
  </nav>
</template>

<script setup lang="ts">
import BaseTab from '@/components/base/BaseTab.vue'
import type { IconName } from '@/components/ui/UiIcon.vue'

interface TabItem {
  id: string | number
  label: string
  icon?: IconName
}

const props = defineProps<{
  modelValue?: TabItem
  items: TabItem[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: TabItem): void
}>()

function handleSelect(item: TabItem): void {
  emit('update:modelValue', item)
}
</script>

<style scoped lang="scss">
@import '@/styles/components/_widget-tab-bar';
</style>
