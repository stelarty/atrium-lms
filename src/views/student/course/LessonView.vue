<template>
  <div class="view student-lesson-view">
    <Transition name="slide" mode="out-in" :duration="{ enter: 300, leave: 300 }">
      <div v-if="showLessonSkeleton" key="loading" class="student-lesson-view__transition-root">
        <section class="section section--no-bg student-lesson-view__skeleton-intro">
          <Skeleton type="text" width="88px" height="20" animated />
          <Skeleton type="title" size="large" width="100%" animated />
          <Skeleton type="text" width="60%" height="20" animated />
        </section>

        <section class="section student-lesson-view__skeleton-media">
          <Skeleton type="section" size="full" :height="280" animated />
        </section>

        <section class="section student-lesson-view__skeleton-panel">
          <Skeleton type="title" size="medium" width="220px" animated />
          <Skeleton type="section" size="full" :height="160" animated />
        </section>
      </div>

      <section v-else-if="error && !isLessonReady" key="error" class="section student-lesson-view__state">
        <h1 class="student-lesson-view__state-title">Не удалось загрузить занятие</h1>
        <p class="student-lesson-view__state-text">{{ error }}</p>
        <BaseButton type="contained" variant="secondary" @click="handleRetry">
          {{ retryButtonLabel }}
        </BaseButton>
      </section>

      <div v-else key="content" class="student-lesson-view__transition-root">
        <section class="section section--no-bg student-lesson-view__intro">
          <BaseButton class="student-lesson-view__back" type="text" variant="secondary" width="fit" @click="goBack">
            <UiIcon name="arrow" direction="left" :size="16" color="#7E8088" />
            Назад
          </BaseButton>

          <h1 class="student-lesson-view__title">{{ lessonTitle }}</h1>
          <p v-if="lessonDescription" class="student-lesson-view__description">
            {{ lessonDescription }}
          </p>
        </section>

        <WidgetStudentLessonRecording v-if="showRecordingBlock && recordingUrl" :recordingUrl="recordingUrl" />

        <section v-else-if="showLiveInfoBlock"
          class="section student-lesson-view__info student-lesson-view__info--scheduled"
          aria-label="Информация о занятии">
          <img class="student-lesson-view__info-image" :src="lessonInfoImage" alt="" width="150" height="150" />

          <BaseChip :variant="mediaMode === 'live' ? 'success' : 'additional'">
            {{ infoChipLabel }}
          </BaseChip>

          <p v-if="scheduledDateLabel" class="student-lesson-view__info-date">
            {{ scheduledDateLabel }}
          </p>

          <p class="student-lesson-view__info-hint">Подключение на занятие по ссылке ниже</p>

          <a v-if="lessonLink" class="student-lesson-view__info-link" :href="lessonLink" target="_blank"
            rel="noopener noreferrer">
            {{ lessonLink }}
          </a>
        </section>

        <section v-if="hasHomework" class="section student-lesson-view__homework"
          aria-labelledby="lesson-homework-title">
          <h2 id="lesson-homework-title" class="student-lesson-view__section-title">
            Домашнее задание
          </h2>

          <p v-if="homeworkSubmitError" class="student-lesson-view__submit-error">
            {{ homeworkSubmitError }}
          </p>

          <div class="student-lesson-view__homework-list">
            <WidgetStudentHomeworkCard v-for="homework in homeworkItems" :key="homework.key" :item="homework"
              :submitLoading="isHomeworkSubmitting(homework.homeworkId)" @submit="handleHomeworkSubmit" />
          </div>
        </section>

        <section class="section student-lesson-view__materials" aria-labelledby="lesson-materials-title">
          <h2 id="lesson-materials-title" class="student-lesson-view__section-title">
            Материалы занятия
          </h2>

          <p v-if="!hasMaterials" class="student-lesson-view__empty">Пока ничего нет</p>

          <template v-else>
            <MaterialFileList
              v-if="hasMaterialFiles"
              :files="materialFileItems"
              :removable="false"
            />

            <div
              v-if="teacherComment"
              class="lesson-teacher-comment-panel student-lesson-view__teacher-comment"
            >
              <BaseRichText variant="materials-comment" :text="teacherComment" />
            </div>
          </template>
        </section>

        <input ref="homeworkFileInputRef" type="file" class="student-lesson-view__file-input"
          @change="handleHomeworkFileChange" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseChip from '@/components/base/BaseChip.vue'
import BaseRichText from '@/components/base/BaseRichText.vue'
import MaterialFileList from '@/components/ui/MaterialFileList.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import WidgetStudentHomeworkCard from '@/components/widgets/WidgetStudentHomeworkCard.vue'
import WidgetStudentLessonRecording from '@/components/widgets/WidgetStudentLessonRecording.vue'
import lessonInfoImage from '@/assets/images/lesson-info.png'
import { useLoadErrorRetry } from '@/composables/useLoadErrorRetry'
import { useStudentHomeworkSubmit } from '@/composables/useStudentHomeworkSubmit'
import { useStudentLesson } from '@/composables/useStudentLesson'

const route = useRoute()
const router = useRouter()

const currentCourseId = computed(() => {
  const id = route.params.courseId
  return Array.isArray(id) ? id[0] : id
})

const currentLessonId = computed(() => {
  const id = route.params.lessonId
  return Array.isArray(id) ? id[0] : id
})

const {
  error,
  lastLoadError,
  isLessonReady,
  showLessonSkeleton,
  lessonTitle,
  lessonDescription,
  mediaMode,
  infoChipLabel,
  scheduledDateLabel,
  lessonLink,
  showRecordingBlock,
  recordingUrl,
  showLiveInfoBlock,
  materialFileItems,
  homeworkItems,
  hasHomework,
  hasMaterialFiles,
  teacherComment,
  hasMaterials,
  loadLessonPage,
  applyWrittenHomeworkSubmission,
} = useStudentLesson(currentLessonId)

const { retryButtonLabel, handleRetry } = useLoadErrorRetry(lastLoadError, () =>
  loadLessonPage(true),
)

const {
  fileInputRef: homeworkFileInputRef,
  error: homeworkSubmitError,
  handleFileChange: handleHomeworkFileChange,
  isHomeworkSubmitting,
  handleSubmitRequest: handleHomeworkSubmit,
} = useStudentHomeworkSubmit({
  courseId: currentCourseId,
  onSuccess: applyWrittenHomeworkSubmission,
})

const goBack = (): void => {
  if (currentCourseId.value) {
    router.push({
      name: 'student-course',
      params: { id: String(currentCourseId.value) },
    })
    return
  }

  router.back()
}
</script>

<style scoped lang="scss">
@import '@/styles/pages/_student_lesson_view.scss';
</style>
