<!-- src/components/base/BaseTab.vue -->
<template>
  <button type="button" class="base-tab" :class="{ 'base-tab--active': active }" :ariaSelected="active"
    :disabled="disabled" @click="handleClick">
    <UiIcon v-if="icon" :name="icon" size="20" class="base-tab__icon" :active="active" />
    <span class="base-tab__label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import UiIcon from '@/components/ui/UiIcon.vue'
import type { IconName } from '@/components/ui/UiIcon.vue'
import { provide } from 'vue'

interface Props {
  /** Идентификатор таба */
  id?: string | number
  /** Текст таба */
  label: string
  /** Иконка слева от текста (необязательно) */
  icon?: IconName
  /** Активен ли таб */
  active?: boolean
  /** Блокирован ли таб для взаимодействия */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  active: false,
  disabled: false,
})

provide('baseIconColor', 'currentColor')

const emit = defineEmits<{
  (e: 'select', id?: string | number): void
}>()

function handleClick(): void {
  if (props.disabled) return
  emit('select', props.id)
}
</script>

<style scoped lang="scss">
@import '@/styles/components/_base-tab';
</style>
