<template>
  <div
    class="widget-lesson-card"
    :class="{ 'widget-lesson-card--interactive': interactive }"
    :role="interactive ? 'button' : undefined"
    :tabindex="interactive ? 0 : undefined"
    @keydown.enter.prevent="handleActivate"
    @keydown.space.prevent="handleActivate"
  >
    <div v-if="showEditIcon" class="widget-lesson-card__edit-icon">
      <UiIcon name="edit" size="24" />
    </div>

    <div v-if="date" class="widget-lesson-card__info">
      <div class="widget-lesson-card__date">{{ date }}</div>
      <BaseChip
        v-if="status"
        class="widget-lesson-card__status"
        :variant="status === 'live' ? 'success' : 'additional'"
      >
        {{ statusLabel }}
      </BaseChip>
    </div>
    <div class="widget-lesson-card__title">{{ title }}</div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import BaseChip from '@/components/base/BaseChip.vue'
import UiIcon from '@/components/ui/UiIcon.vue'

type LessonCardStatus = 'live' | 'upcoming'

const props = withDefaults(
  defineProps<{
    title: string
    date?: string | null
    interactive?: boolean
    showEditIcon?: boolean
    status?: LessonCardStatus | null
  }>(),
  { interactive: false, showEditIcon: false, status: null },
)

const emit = defineEmits<{
  (event: 'activate'): void
}>()

const handleActivate = (): void => {
  if (props.interactive) {
    emit('activate')
  }
}

const statusLabel = computed(() => {
  if (props.status === 'live') return 'В прямом эфире'
  if (props.status === 'upcoming') return 'Предстоящее'
  return ''
})
</script>
<style lang="scss">
@import '@/styles/components/_widget-lesson-card.scss';
</style>
