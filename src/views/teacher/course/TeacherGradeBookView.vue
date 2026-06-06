<template>
  <div class="teacher-gradebook-view">
    <Transition name="slide" mode="out-in" :duration="{ enter: 300, leave: 300 }">
      <section v-if="showPageSkeleton" key="loading" class="section teacher-gradebook-view__skeleton">
        <Skeleton type="text" width="180px" height="24" animated />
        <Skeleton type="section" size="full" :height="44" animated />
        <Skeleton type="section" size="full" :height="120" animated />
        <Skeleton type="section" size="full" :height="280" animated />
      </section>

      <section v-else-if="pageError" key="error" class="section teacher-gradebook-view__state">
        <h2 class="teacher-gradebook-view__state-title">Не удалось загрузить журнал</h2>
        <p class="teacher-gradebook-view__state-text">{{ pageError }}</p>
        <BaseButton type="contained" variant="secondary" @click="retryInitialize">Повторить</BaseButton>
      </section>

      <section v-else-if="showFiltersEmptyState" key="empty-filters" class="section teacher-gradebook-view__state">
        <StudentCourseEmptyState
          title="В курсе пока нет домашних заданий для журнала"
          :image-src="lessonsEmptyImage"
          image-alt="Домашние задания не найдены"
        />
      </section>

      <section v-else key="content" class="section teacher-gradebook-view__panel">
        <WidgetTeacherGradebookFilters
          :components="components"
          :display-mode="displayMode"
          :active-component="activeComponent"
          :has-difficulty-levels="hasDifficultyLevels"
          :selected-difficulty="selectedDifficulty"
          :difficulty-tabs="difficultyTabs"
          :selected-lesson-id="selectedLessonId"
          :selected-homework-id="selectedHomeworkId"
          :lesson-options="lessonOptions"
          :homework-options="homeworkOptions"
          :homework-header="showHomeworkPreview ? homeworkHeader : null"
          :template-files="templateFiles"
          @select-component="handleSelectSection"
          @update:selected-difficulty="selectedDifficulty = $event"
          @update:selected-lesson-id="selectedLessonId = $event"
          @update:selected-homework-id="selectedHomeworkId = $event"
        />
      </section>
    </Transition>

    <Transition name="slide" mode="out-in" :duration="{ enter: 300, leave: 300 }">
      <section
        v-if="showDetailSkeleton && !showSubmissionsEmptyState && !detailError"
        key="skeleton"
        class="section teacher-gradebook-view__skeleton"
      >
        <Skeleton type="section" size="full" :height="320" animated />
      </section>
      <section v-else-if="detailError" key="detail-error" class="section teacher-gradebook-view__state">
        <h2 class="teacher-gradebook-view__state-title">Не удалось загрузить список студентов</h2>
        <p class="teacher-gradebook-view__state-text">{{ detailError }}</p>
        <BaseButton type="contained" variant="secondary" @click="retryLoadDetail">Повторить</BaseButton>
      </section>
      <section v-else-if="showSubmissionsEmptyState" key="empty" class="section teacher-gradebook-view__state">
        <StudentCourseEmptyState
          title="Студенты еще не отправили работы на проверку"
          :image-src="lessonsEmptyImage"
          image-alt="Работы на проверку не поступали"
        />
      </section>
      <section v-else-if="submissions.length > 0" key="content" class="section teacher-gradebook-view__table">
        <WidgetTeacherGradebookTable
          :submissions="submissions"
          :show-download-column="showStudentWorkDownload"
          :show-review-column="showReviewAction"
          :opening-review-user-id="openingReviewUserId"
          @download="handleDownloadSubmission"
          @review="openReviewModal"
        />
      </section>
    </Transition>

    <WidgetTeacherGradebookReviewModal
      v-model="isReviewModalOpen"
      v-model:draft="reviewDraft"
      :submission="activeSubmission"
      :saving="store.isReviewSaving"
      :error="store.reviewError"
      :can-save="canSaveReview"
      :save-button-label="reviewSaveButtonLabel"
      @close="closeReviewModal"
      @save="saveReview"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import WidgetTeacherGradebookFilters from '@/components/widgets/WidgetTeacherGradebookFilters.vue'
import WidgetTeacherGradebookReviewModal from '@/components/widgets/WidgetTeacherGradebookReviewModal.vue'
import WidgetTeacherGradebookTable from '@/components/widgets/WidgetTeacherGradebookTable.vue'
import lessonsEmptyImage from '@/assets/images/lessons-emty.png'
import { useTeacherGradebook } from '@/composables/useTeacherGradebook'
import StudentCourseEmptyState from '@/views/student/course/_shared/StudentCourseEmptyState.vue'

const props = defineProps<{
  courseId?: string | number
}>()

const route = useRoute()

const currentCourseId = computed(() => {
  const id = props.courseId ?? route.params.id
  return Array.isArray(id) ? id[0] : id
})

const {
  store,
  components,
  displayMode,
  hasDifficultyLevels,
  selectedDifficulty,
  selectedLessonId,
  selectedHomeworkId,
  isReviewModalOpen,
  openingReviewUserId,
  activeSubmission,
  reviewDraft,
  activeComponent,
  lessonOptions,
  homeworkOptions,
  difficultyTabs,
  homeworkHeader,
  templateFiles,
  submissions,
  showStudentWorkDownload,
  showReviewAction,
  showPageSkeleton,
  showFiltersEmptyState,
  showDetailSkeleton,
  pageError,
  detailError,
  showSubmissionsEmptyState,
  loadDetail,
  showHomeworkPreview,
  canSaveReview,
  reviewSaveButtonLabel,
  retryInitialize,
  retryLoadDetail,
  handleSelectSection,
  openReviewModal,
  closeReviewModal,
  saveReview,
  handleDownloadSubmission,
} = useTeacherGradebook({ courseId: currentCourseId })
</script>

<style scoped lang="scss">
@import '@/styles/pages/_teacher_gradebook_view';
</style>
