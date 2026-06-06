<template>
  <article class="widget-student-homework-card" :class="`widget-student-homework-card--${item.type}`">
    <div class="widget-student-homework-card__head">
      <div class="widget-student-homework-card__title-wrap">
        <h3 class="widget-student-homework-card__title">{{ item.title }}</h3>
        <p v-if="item.deadlineLabel" class="widget-student-homework-card__deadline">
          Дедлайн:
          <span class="widget-student-homework-card__deadline-value">
            {{ item.deadlineLabel }}
          </span>
        </p>
      </div>

      <BaseChip v-if="item.statusLabel && item.statusVariant" class="widget-student-homework-card__status"
        :variant="item.statusVariant">
        {{ item.statusLabel }}
      </BaseChip>
    </div>

    <BaseMark v-if="item.listeningInfoLabel">
      {{ item.listeningInfoLabel }}
    </BaseMark>

    <MaterialFileList v-if="item.files.length > 0" :files="item.files" :removable="false" />

    <BaseMark v-if="item.showReviewFeedback" class="widget-student-homework-card__feedback">
      <span v-if="item.showFinalScore && item.scoreText" class="widget-student-homework-card__feedback-score">
        Итоговый балл:
        <span class="widget-student-homework-card__feedback-score-value">{{ item.scoreText }}</span>
      </span>
      <span v-if="item.reviewerComment" class="widget-student-homework-card__feedback-comment">
        <span class="widget-student-homework-card__feedback-comment-text">Комментарий от преподавателя:</span>
        <span class="widget-student-homework-card__feedback-comment-text">{{ item.reviewerComment }}</span>
      </span>
    </BaseMark>

    <BaseButton v-if="item.showSubmitButton && item.submitButtonLabel" class="widget-student-homework-card__submit"
      type="contained" variant="primary" width="fit" :disabled="submitLoading" @click="handleSubmitClick">
      {{ submitButtonLabel }}
    </BaseButton>

    <BaseButton v-if="item.showTestButton && item.actionLabel" class="widget-student-homework-card__test-action"
      type="contained" variant="primary" :href="item.actionUrl || undefined" target="_blank" width="fit"
      :disabled="!item.actionUrl">
      {{ item.actionLabel }}
    </BaseButton>

    <BaseButton v-if="item.actionLabel && item.actionUrl && item.type === 'oral'"
      class="widget-student-homework-card__oral-action" type="contained" variant="primary" :href="item.actionUrl"
      target="_blank" width="fit">
      {{ item.actionLabel }}
    </BaseButton>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseChip from '@/components/base/BaseChip.vue'
import BaseMark from '@/components/base/BaseMark.vue'
import MaterialFileList from '@/components/ui/MaterialFileList.vue'
import type { StudentHomeworkCardViewModel } from '@/types/student-homework'

const props = withDefaults(
  defineProps<{
    item: StudentHomeworkCardViewModel
    submitLoading?: boolean
  }>(),
  {
    submitLoading: false,
  },
)

const emit = defineEmits<{
  (e: 'submit', homeworkId: number, isSubmissionReplace: boolean): void
}>()

const submitButtonLabel = computed(() => {
  if (props.submitLoading) return 'Отправка...'
  return props.item.submitButtonLabel
})

const handleSubmitClick = (): void => {
  if (props.item.homeworkId === null) return
  emit('submit', props.item.homeworkId, props.item.isSubmissionReplace)
}
</script>

<style scoped lang="scss">
@import '@/styles/components/_widget-student-homework-card.scss';
</style>
