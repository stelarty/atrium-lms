<template>
  <div class="student-homework-view">
    <StudentCourseEmptyState v-if="showCourseEmptyState" title="Похоже, курс ещё не начался, и занятий пока нет"
      subtitle="Дождитесь, пока преподаватель добавит материал" :imageSrc="lessonsEmptyImage"
      imageAlt="Домашних заданий пока нет" />

    <section v-else class="section student-homework-view__panel">
      <div class="student-homework-view__header">
        <WidgetPartSelector v-if="activeComponent && !showPartSelectorSkeleton" :parts="components"
          :activePart="activeComponent" :displayMode="studentCourseStore.program?.display_mode"
          @select="handleSelectComponent" />
        <Skeleton v-else type="title" animated />

        <WidgetSegmentControl v-model="activeFilter" class="student-homework-view__filters" :tabs="filterTabs" />
      </div>
      <Transition name="slide" mode="out-in" :duration="{ enter: 300, leave: 300 }">
        <BaseBanner v-if="showOverdueBanner" class="student-homework-view__banner" title="Просроченные задания"
          description="Выполните их как можно скорее, чтобы не отстать от программы"
          :sessionDismissKey="overdueBannerDismissKey || undefined" ariaLabel="Справка о просроченных заданиях"
          :imageSrc="overdueBannerImage" imageAlt="" />
      </Transition>
      <Transition name="slide" mode="out-in" :duration="{ enter: 300, leave: 300 }">
        <div :key="homeworkContentKey" class="student-homework-view__content">
          <section v-if="error" class="student-homework-view__state">
            <h2 class="student-homework-view__state-title">Не удалось загрузить домашние задания</h2>
            <p class="student-homework-view__state-text">{{ error }}</p>
            <BaseButton type="contained" variant="secondary" @click="handleRetry">
              {{ retryButtonLabel }}
            </BaseButton>
          </section>

          <template v-else>
            <div v-if="showHomeworkCardsSkeleton" class="student-homework-view__cards-skeleton" aria-busy="true"
              aria-label="Загрузка домашних заданий">
              <Skeleton v-for="index in HOMEWORK_CARD_SKELETON_COUNT" :key="index" type="section" size="full"
                :height="160" animated />
            </div>

            <StudentCourseEmptyState v-else-if="showFilteredEmptyState" title="Пока ничего нет"
              :imageSrc="lessonsEmptyImage" imageAlt="Домашних заданий нет" />

            <template v-else>
              <p v-if="homeworkSubmitError" class="student-homework-view__submit-error">
                {{ homeworkSubmitError }}
              </p>

              <div class="student-homework-view__groups">
                <section v-for="group in lessonGroups" :key="group.lessonId" class="student-homework-view__group">
                  <h2 class="student-homework-view__group-title">{{ group.lessonTitle }}</h2>

                  <WidgetStudentHomeworkCard
                    v-for="card in group.items"
                    :key="card.key"
                    :item="card"
                    :submit-loading="isHomeworkSubmitting(card.homeworkId)"
                    @submit="handleHomeworkSubmit"
                  />
                </section>
              </div>

              <input ref="homeworkFileInputRef" type="file" class="student-homework-view__file-input"
                @change="handleHomeworkFileChange" />
            </template>
          </template>
        </div>
      </Transition>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BaseBanner from '@/components/base/BaseBanner.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import WidgetPartSelector from '@/components/widgets/WidgetPartSelector.vue'
import WidgetSegmentControl from '@/components/widgets/WidgetSegmentControl.vue'
import WidgetStudentHomeworkCard from '@/components/widgets/WidgetStudentHomeworkCard.vue'
import lessonsEmptyImage from '@/assets/images/lessons-emty.png'
import overdueBannerImage from '@/assets/images/homework-overdue.svg'
import { useLoadErrorRetry } from '@/composables/useLoadErrorRetry'
import {
  STUDENT_HOMEWORK_FILTER_TABS,
  useStudentHomework,
} from '@/composables/useStudentHomework'
import { useStudentHomeworkSubmit } from '@/composables/useStudentHomeworkSubmit'
import { useStudentCourseStore } from '@/stores/useStudentCourseStore'
import StudentCourseEmptyState from './_shared/StudentCourseEmptyState.vue'

const HOMEWORK_CARD_SKELETON_COUNT = 2

const props = defineProps<{
  courseId?: string | number
}>()

const route = useRoute()
const studentCourseStore = useStudentCourseStore()

const currentCourseId = computed(() => {
  const id = props.courseId ?? route.params.id ?? route.params.courseId
  return Array.isArray(id) ? id[0] : id
})

const {
  activeFilter,
  activeComponent,
  components,
  lessonGroups,
  error,
  lastLoadError,
  showPartSelectorSkeleton,
  showHomeworkCardsSkeleton,
  showCourseEmptyState,
  showFilteredEmptyState,
  showOverdueBanner,
  loadHomeworkPage,
  setActiveComponent,
  applyWrittenHomeworkSubmission,
} = useStudentHomework(currentCourseId)

const { retryButtonLabel, handleRetry } = useLoadErrorRetry(lastLoadError, () =>
  loadHomeworkPage(true),
)

const filterTabs = STUDENT_HOMEWORK_FILTER_TABS

const homeworkContentKey = computed(
  () => `${activeFilter.value}-${activeComponent.value?.id ?? 'none'}`,
)

const overdueBannerDismissKey = computed(() => {
  const id = currentCourseId.value
  if (id === undefined || id === null || id === '') return ''
  return `lms:student:homework-overdue-banner:dismissed:${String(id)}`
})

const handleSelectComponent = (part: { id: number | string; title: string }): void => {
  const matched = components.value.find((item) => item.id === part.id)
  if (matched) {
    setActiveComponent(matched)
  }
}

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
</script>

<style scoped lang="scss">
@import '@/styles/pages/_student_homework_view';
</style>
