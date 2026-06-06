<template>
  <div class="course-settings-basics-section">
    <WidgetSectionCard title="Основные настройки">
      <BaseInput
        v-model="draftSettings.title"
        label="Название курса"
        placeholder="Введите название курса"
        :error="fieldErrors.title"
      />

      <div class="course-settings-basics-section__grid">
        <BaseSelect
          v-model="draftSettings.subject"
          label="Предмет"
          placeholder="Выберите предмет"
          :options="subjectOptions"
          :error="fieldErrors.subject"
        />

        <BaseInput
          v-model="draftSettings.lessonCount"
          label="Кол-во занятий"
          placeholder="Введите количество"
          type="number"
          :error="fieldErrors.lessonCount"
        />
      </div>

      <div class="course-settings-basics-section__grid">
        <BaseDate
          v-model="draftSettings.startDate"
          label="Дата начала"
          :error="fieldErrors.startDate"
        />

        <BaseDate
          v-model="draftSettings.endDate"
          label="Дата конца"
          :error="fieldErrors.endDate"
          :min="draftSettings.startDate || ''"
        />
      </div>

      <BaseInput
        v-model="draftSettings.programUrl"
        label="Ссылка на программу"
        placeholder="https://example.com"
        hint="Ссылка на pdf программу из сайта"
      />

      <BaseSwitcher
        v-model="draftSettings.hasDifficultyLevels"
        label="Добавить уровни сложности"
        hint="По умолчанию - легкий, средний и тяжелый"
      />
    </WidgetSectionCard>

    <WidgetSectionCard title="Доступ к курсу">
      <BaseDate
        v-model="draftSettings.materialsAvailableUntil"
        label="Материалы доступны до"
        hint="Когда у студента заканчивается доступ к курсу, нужно выбрать крайний срок доступа ко всем материалам"
        :error="fieldErrors.materialsAvailableUntil"
        :min="draftSettings.endDate || ''"
      />
    </WidgetSectionCard>

    <WidgetSectionCard title="Онлайн-трансляция">
      <BaseInput
        v-model="draftSettings.videoConferenceUrl"
        label="Ссылка для подключения на онлайн-трансляцию"
        hint="Ссылка по умолчанию для всех занятий, но в настройках занятия можно указать другую"
        placeholder="https://example.com/meeting"
        type="url"
        :error="fieldErrors.videoConferenceUrl"
      />
    </WidgetSectionCard>
  </div>
</template>

<script setup lang="ts">
import BaseDate from '@/components/base/BaseDate.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseSwitcher from '@/components/base/BaseSwitcher.vue'
import WidgetSectionCard from '@/components/widgets/WidgetSectionCard.vue'
import type { BaseSelectOption } from '@/components/base/BaseSelect.vue'
import type { CourseDraftSettings, CourseFieldErrors } from '@/types/course-draft'

defineProps<{
  draftSettings: CourseDraftSettings
  fieldErrors: CourseFieldErrors
  subjectOptions: BaseSelectOption[]
}>()
</script>

<style scoped lang="scss">
.course-settings-basics-section {
  display: flex;
  flex-direction: column;
  gap: $m6;

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: $m4;
  }
}

@media (max-width: 768px) {
  .course-settings-basics-section {
    &__grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
