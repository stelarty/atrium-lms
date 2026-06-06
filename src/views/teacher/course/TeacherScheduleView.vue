<!-- src/views/teacher/course/TeacherScheduleView.vue -->
<template>
  <div class="teacher-schedule-view">
    <section class="section schedule__section">
      <h3 class="schedule__title">Расписание занятий</h3>
      <p class="schedule__description">
        Установите дни и время проведения занятий для вашего курса.
      </p>

      <div class="schedule__content">
        <p class="schedule__empty">Расписание не установлено</p>
        <BaseButton type="contained" variant="primary" size="medium">
          <UiIcon name="calendar" size="18" />
          <span>Добавить расписание</span>
        </BaseButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import type { Course } from '@/composables/useTeacherCourseCreation'

defineProps<{
  course?: Course
}>()
</script>

<style scoped lang="scss">
.teacher-schedule-view {
  display: flex;
  flex-direction: column;
  gap: $m6;
}

.schedule__section {
  display: flex;
  flex-direction: column;
  gap: $m4;
}

.schedule__title {
  font-size: 1.2rem;
  font-weight: 600;
  color: $text-default-primary;
}

.schedule__description {
  color: $text-default-secondary;
  font-size: 0.95rem;
  line-height: 1.5;
}

.schedule__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $m4;
  padding: $m6;
  border: 2px dashed rgba($text-default-secondary, 0.3);
  border-radius: $m5;
  background-color: rgba($surface-default-secondary, 0.5);
  min-height: 200px;
  justify-content: center;
  text-align: center;
}

.schedule__empty {
  color: $text-default-secondary;
  font-size: 0.95rem;
}
</style>
