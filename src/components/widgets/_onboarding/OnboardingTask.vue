<!-- src/components/widgets/_onboarding/OnboardingTask.vue -->
<template>
  <div
    class="widget-onboarding__task"
    :class="[
      `widget-onboarding__task--${task.status}`,
      {
        'widget-onboarding__task--disabled': !task.available && task.status !== 'current',
      },
    ]"
  >
    <!-- Чекбокс — только если выполнено -->
    <BaseCheckbox
      v-if="task.status === 'completed'"
      :checked="true"
      class="widget-onboarding__checkbox"
    />

    <!-- Надпись "Текущее задание" -->
    <span
      v-else-if="task.status === 'current'"
      class="widget-onboarding__badge widget-onboarding__badge--current"
    >
      Текущее задание
    </span>

    <!-- Следующее задание -->
    <span
      v-else-if="isNextAvailable"
      class="widget-onboarding__badge widget-onboarding__badge--next"
    >
      Следующее задание
    </span>

    <!-- Остальные недоступные — placeholder -->
    <span v-else class="widget-onboarding__badge widget-onboarding__badge--placeholder"></span>

    <!-- Текст задачи -->
    <span
      class="widget-onboarding__label"
      :class="{
        'widget-onboarding__label--current': task.status === 'current',
        'widget-onboarding__label--disabled': !task.available && task.status !== 'current',
        'widget-onboarding__label--default': task.status === 'pending',
      }"
      v-html="task.label"
    >
    </span>
  </div>
</template>

<script setup lang="ts">
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'

interface Task {
  label: string
  status: 'completed' | 'current' | 'pending'
  available: boolean
}

defineProps<{
  task: Task
  isNextAvailable: boolean
}>()
</script>

<style scoped lang="scss">
@import '@/styles/components/_widget-onboarding';
</style>
