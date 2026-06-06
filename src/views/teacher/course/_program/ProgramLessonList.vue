<template>
  <div class="program-lesson-list">
    <Transition name="slide" mode="out-in">
      <div v-if="isLoading" key="skeleton" class="program-lesson-list__group">
        <Skeleton v-for="i in 2" :key="i" type="rect" size="full" height="120" animated variant="light" />
      </div>

      <div v-else key="lessons" class="program-lesson-list__group">
        <template v-if="lessons.length > 0">
          <div class="program-lesson-list__section-header">
            <h3 class="program-lesson-list__section-title program-lesson-list__section-title--upcoming">
              Предстоящие занятия
            </h3>
          </div>

          <WidgetLessonCard
            v-for="lesson in lessons"
            :key="`upcoming-${lesson.id}`"
            class="program-lesson-list__item"
            interactive
            :title="lesson.title"
            :date="lesson.starts_at_label"
            :showEditIcon="showEditIcon"
            :status="lesson.status"
            @click="emit('select', lesson)"
            @activate="emit('select', lesson)"
          />
        </template>

        <template v-if="pastLessons.length > 0">
          <div ref="pastRef" class="program-lesson-list__section-header">
            <h3 class="program-lesson-list__section-title program-lesson-list__section-title--past">
              Прошедшие занятия
            </h3>
          </div>

          <WidgetLessonCard
            v-for="lesson in pastLessons"
            :key="`past-${lesson.id}`"
            class="program-lesson-list__item program-lesson-list__item--past"
            interactive
            :title="lesson.title"
            :date="lesson.starts_at_label"
            :showEditIcon="showEditIcon"
            :status="lesson.status"
            @click="emit('select', lesson)"
            @activate="emit('select', lesson)"
          />
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WidgetLessonCard from '@/components/widgets/WidgetLessonCard.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

interface ProgramLessonListItem {
  id: number
  title: string
  starts_at: string | null
  starts_at_label: string | null
  status?: 'live' | 'upcoming' | null
}

withDefaults(
  defineProps<{
    lessons: ProgramLessonListItem[]
    pastLessons?: ProgramLessonListItem[]
    isLoading?: boolean
    showEditIcon?: boolean
  }>(),
  {
    pastLessons: () => [],
    showEditIcon: false,
  },
)

const emit = defineEmits<{
  (e: 'select', lesson: ProgramLessonListItem): void
}>()

const pastRef = ref<HTMLElement | null>(null)

defineExpose({ pastRef })
</script>

<style scoped lang="scss">
.program-lesson-list__group {
  @include flex-center(column, start, stretch);
  gap: $m6;
  width: 100%;
}

.program-lesson-list__section-header {
  padding-top: 20px;
}

.program-lesson-list__section-title {
  margin: 0;
  padding: 0;
  min-width: 0;
  @include font-titles-body-subheader();

  &--upcoming {
    color: $text-default-accent;
  }

  &--past {
    color: $text-default-warning;
  }
}

.program-lesson-list__item--past :deep(.widget-lesson-card__title) {
  color: $text-default-secondary;
}
</style>
