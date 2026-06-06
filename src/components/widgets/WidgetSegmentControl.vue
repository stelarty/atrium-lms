<!-- src/components/widgets/WidgetSegmentControl.vue -->
<template>
  <nav class="widget-segment-control" role="tablist" :class="{'widget-segment-control--stretch': width === 'stretch' }">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      @click="selectTab(tab)"
      class="widget-segment-control__button"
      role="tab"
      :aria-selected="currentId === tab.id"
      :class="{ 'widget-segment-control__button--active': currentId === tab.id }"
      :disabled="tab.disabled"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface TabItem {
  id: string | number
  label: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    tabs: TabItem[]
    width?: 'stretch' | 'auto'
  }>(),
  {

    width: 'auto',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

// Вычисляем текущий ID на основе modelValue или первой табки
const currentId = computed(() => {
  return props.modelValue || props.tabs[0]?.id
})

const selectTab = (item: TabItem): void => {
  if (item.disabled || currentId.value === item.id) return
  emit('update:modelValue', item.id)
}
</script>

<style scoped lang="scss">
@import '@/styles/components/_widget-segment-control';
</style>
