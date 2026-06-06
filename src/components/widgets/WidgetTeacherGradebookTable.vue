<template>
  <div
    class="widget-teacher-gradebook-table"
    :class="{ 'widget-teacher-gradebook-table--compact': isCompactLayout }"
    role="table"
    aria-label="Журнал студентов"
  >
    <div class="widget-teacher-gradebook-table__header" role="row">
      <span
        class="widget-teacher-gradebook-table__cell widget-teacher-gradebook-table__cell--name"
        role="columnheader"
      >
        ФИО студента
      </span>
      <span class="widget-teacher-gradebook-table__cell" role="columnheader">Статус</span>
      <span
        class="widget-teacher-gradebook-table__cell widget-teacher-gradebook-table__cell--score"
        role="columnheader"
      >
        Баллы
      </span>
      <span
        v-if="showDownloadColumn"
        class="widget-teacher-gradebook-table__cell widget-teacher-gradebook-table__cell--download"
        role="columnheader"
      >
        Работа студента
      </span>
      <span
        v-if="showReviewColumn"
        class="widget-teacher-gradebook-table__cell widget-teacher-gradebook-table__cell--review"
        role="columnheader"
      >
        Проверка
      </span>
    </div>

    <div
      v-for="submission in submissions"
      :key="submission.user_id"
      class="widget-teacher-gradebook-table__row"
      role="row"
    >
      <div
        class="widget-teacher-gradebook-table__cell widget-teacher-gradebook-table__cell--name"
        role="cell"
      >
        <p class="widget-teacher-gradebook-table__name">{{ submission.full_name }}</p>
        <p v-if="submission.email" class="widget-teacher-gradebook-table__email">
          {{ submission.email }}
        </p>
      </div>

      <div class="widget-teacher-gradebook-table__cell" role="cell">
        <BaseChip :variant="getStatusVariant(submission.status)">
          {{ submission.status_label }}
        </BaseChip>
      </div>

      <div
        class="widget-teacher-gradebook-table__cell widget-teacher-gradebook-table__cell--score"
        role="cell"
      >
        {{ submission.score_label }}
      </div>

      <div
        v-if="showDownloadColumn"
        class="widget-teacher-gradebook-table__cell widget-teacher-gradebook-table__cell--download"
        role="cell"
      >
        <BaseButton
          type="contained"
          variant="secondary"
          width="fit"
          :disabled="!canDownload(submission)"
          @click="emit('download', submission)"
        >
          Скачать
        </BaseButton>
      </div>

      <div
        v-if="showReviewColumn"
        class="widget-teacher-gradebook-table__cell widget-teacher-gradebook-table__cell--review"
        role="cell"
      >
        <BaseButton
          type="contained"
          variant="secondary"
          width="fit"
          :disabled="!canReview(submission) || isReviewOpening(submission)"
          @click="emit('review', submission)"
        >
          {{ reviewButtonLabel(submission) }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseChip from '@/components/base/BaseChip.vue'
import type { TeacherGradebookSubmission } from '@/types/teacher-gradebook'
import {
  TEACHER_GRADEBOOK_STATUS_VARIANTS,
  canDownloadTeacherGradebookSubmission,
  canOpenTeacherGradebookReview,
} from '@/utils/teacher-gradebook-labels'

const props = withDefaults(
  defineProps<{
    submissions: TeacherGradebookSubmission[]
    showDownloadColumn?: boolean
    showReviewColumn?: boolean
    openingReviewUserId?: string | null
  }>(),
  {
    showDownloadColumn: true,
    showReviewColumn: true,
    openingReviewUserId: null,
  },
)

const isCompactLayout = computed(
  () => !props.showDownloadColumn && !props.showReviewColumn,
)

const emit = defineEmits<{
  (event: 'download', submission: TeacherGradebookSubmission): void
  (event: 'review', submission: TeacherGradebookSubmission): void
}>()

const getStatusVariant = (status: TeacherGradebookSubmission['status']) =>
  TEACHER_GRADEBOOK_STATUS_VARIANTS[status]

const canDownload = canDownloadTeacherGradebookSubmission
const canReview = canOpenTeacherGradebookReview

const isReviewOpening = (submission: TeacherGradebookSubmission): boolean =>
  props.openingReviewUserId === submission.user_id

const reviewButtonLabel = (submission: TeacherGradebookSubmission): string =>
  isReviewOpening(submission) ? 'Загрузка...' : 'Проверить'
</script>

<style scoped lang="scss">
@import '@/styles/components/_widget-teacher-gradebook-table';
</style>
