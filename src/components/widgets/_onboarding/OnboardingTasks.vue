<!-- src/components/widgets/_onboarding/OnboardingTasks.vue -->
<template>
    <div class="widget-onboarding__tasks">
      <div class="widget-onboarding__checklist">
        <OnboardingTask
          v-for="(task, index) in tasks"
          :key="index"
          :task="task"
          :isNextAvailable="isNextAvailableTaskLocal(index)"
        />
      </div>
    </div>
</template>

<script setup lang="ts">
import OnboardingTask from './OnboardingTask.vue'

interface Task {
  label: string
  status: 'completed' | 'current' | 'pending'
  available: boolean
}

const props = defineProps<{
  tasks: Task[]
  isNextAvailableTask: (index: number) => boolean
}>()

/**
 * Проверить, является ли задача следующей доступной
 */
const isNextAvailableTaskLocal = (index: number): boolean => {
  return props.isNextAvailableTask(index)
}
</script>

<style scoped lang="scss">
@import '@/styles/components/_widget-onboarding';
</style>
