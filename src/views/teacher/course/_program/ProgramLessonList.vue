<template>
  <div class="program-lesson-list">

    <Transition name="slide" mode="out-in">
      <div v-if="isLoading" key="skeleton" class="program-lesson-list__group">
        <Skeleton v-for="i in 2" :key="i" type="rect" size="full" height="120" animated variant="light"/>
      </div>

      <div v-else key="lessons" class="program-lesson-list__group">
        <!-- Upcoming section header -->
        <div ref="upcomingRef" class="program-lesson-list__section-header">
          <h3 class="program-lesson-list__section-title program-lesson-list__section-title--upcoming">
            Предстоящие занятия
          </h3>
          <button
            v-if="pastLessons.length > 0"
            class="program-lesson-list__scroll-btn"
            @click="scrollTo(pastRef)"
          >
            Прошедшие ›
          </button>
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

        <template v-if="pastLessons.length > 0">
          <!-- Past section header (with dino) -->
          <div ref="pastRef" class="program-lesson-list__section-header program-lesson-list__section-header--past">
            <h3 class="program-lesson-list__section-title program-lesson-list__section-title--past">
              Прошедшие занятия
            </h3>
            <button
              class="program-lesson-list__scroll-btn"
              @click="scrollTo(upcomingRef)"
            >
              Предстоящие ›
            </button>
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

const upcomingRef = ref<HTMLElement | null>(null)
const pastRef = ref<HTMLElement | null>(null)

function scrollTo(el: HTMLElement | null): void {
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

defineExpose({ pastRef })
</script>

<style scoped lang="scss">
.program-lesson-list__group {
  @include flex-center(column, start, stretch);
  gap: $m6;
  width: 100%;
}

.program-lesson-list__section-header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: $m4;
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

.program-lesson-list__scroll-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  @include font-body-button();
  color: $text-default-accent;
  white-space: nowrap;
  justify-self: end;

  &:hover {
    color: $text-hover-accent;
  }

  &:active {
    color: $text-pressed-accent;
  }
}

.program-lesson-list__item--past :deep(.widget-lesson-card__title) {
  color: $text-default-secondary;
}
</style>
