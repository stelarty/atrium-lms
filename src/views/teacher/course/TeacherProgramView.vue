<template>
  <div class="teacher-program-view">
    <Transition name="slide" mode="out-in" :duration="{ enter: 400, leave: 400 }">
      <Skeleton v-if="courseStore.isLoading" key="course-skeleton" type="section" size="full" animated />
      <section v-else key="content" class="section program">
        <ProgramPartEditor v-if="isEditingPart" v-model:title="editingPartTitle" :part="activePart" @cancel="cancelEdit"
          @save="handleSavePart" @delete="handleDeletePart" />
        <template v-else>
          <WidgetPartSelector :parts="parts" :activePart="activePart" :displayMode="displayMode"
            @select="handleSelectPart" @create="handleCreatePart">
            <template #toolbar-actions>
              <BaseIconButton type="text" variant="primary" :disabled="!isSettingsCompleted"
                aria-label="Добавить занятие" @click="navigateToLessonCreation">
                <UiIcon name="add" size="24" color="#7E8088" />
              </BaseIconButton>
              <BaseIconButton v-if="canEditPart" type="text" variant="secondary" :disabled="!isSettingsCompleted"
                aria-label="Настройки раздела" @click="handleStartEditingPart">
                <UiIcon name="edit" size="24" />
              </BaseIconButton>
            </template>
          </WidgetPartSelector>
          <ProgramToolbar :can-edit-part="canEditPart" :disabled="!isSettingsCompleted" :model-value="searchQuery"
            @update:model-value="searchQuery = $event" @add-lesson="navigateToLessonCreation"
            @edit-part="handleStartEditingPart" />

          <p v-if="programNotice" class="program__warning" role="alert">{{ programNotice }}</p>

          <p v-if="!isSettingsCompleted" class="program__warning">
            Внимание! Сначала заполните все поля в настройках курса.
          </p>

          <template v-else-if="activePart">
            <WidgetSegmentControl v-model="scheduleFilter" :tabs="scheduleTabs" />

            <div v-if="hasDifficultyLevels" class="program__difficulty">
              <span class="program__difficulty-label">Уровень</span>
              <WidgetSegmentControl v-model="activeDifficultyLevel" :tabs="difficultyTabs" />
            </div>

            <Transition name="fade" mode="out-in">
              <ProgramLessonList v-if="!showLessonsEmptyState && !showFilteredLessonsEmpty && !showSearchEmptyState && !showScheduleFilterEmpty"
                key="lessons" :lessons="visibleLessons" :pastLessons="visiblePastLessons"
                :isLoading="showLessonsSkeleton" showEditIcon @select="handleSelectLesson" />

              <EmptyCreateFirst v-else-if="showLessonsEmptyState || showFilteredLessonsEmpty" key="empty"
                title="Занятий пока нет" subtitle="Давайте создадим первое занятие">
                <template #actions>
                  <BaseButton type="contained" variant="primary" @click="navigateToLessonCreation">
                    <span>Создать занятие</span>
                    <UiIcon name="add" size="18" />
                  </BaseButton>
                </template>
              </EmptyCreateFirst>

              <EmptyNoResults v-else-if="showSearchEmptyState" key="no-results" title="Результатов не найдено" />

              <EmptyCreateFirst v-else-if="showScheduleFilterEmpty" key="schedule-empty"
                :title="scheduleFilterEmptyTitle" subtitle="Попробуйте выбрать другой фильтр" />
            </Transition>
          </template>
        </template>
      </section>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTeacherProgramParts } from '@/composables/useTeacherProgramParts'
import { useTeacherProgramLessons } from '@/composables/useTeacherProgramLessons'
import { useCourseStore } from '@/stores/useCourseStore'
import ProgramPartEditor from './_program/ProgramPartEditor.vue'
import WidgetPartSelector from '@/components/widgets/WidgetPartSelector.vue'
import WidgetSegmentControl from '@/components/widgets/WidgetSegmentControl.vue'
// import ProgramSectionEmptyState from './_program/ProgramSectionEmptyState.vue'
import ProgramToolbar from './_program/ProgramToolbar.vue'
import ProgramLessonList from './_program/ProgramLessonList.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import EmptyCreateFirst from '@/components/ui/empty/EmptyCreateFirst.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIconButton from '@/components/base/BaseIconButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import EmptyNoResults from '@/components/ui/empty/EmptyNoResults.vue'

const router = useRouter()
const courseStore = useCourseStore()

const {
  activePart,
  isEditingPart,
  editingPartTitle,
  parts,
  displayMode,
  isSettingsCompleted,
  setActivePart,
  createPart,
  startEditingPart,
  cancelEdit,
  savePart,
  deletePart,
} = useTeacherProgramParts()

const courseId = computed(() => courseStore.createdCourse?.id ?? 0)

const {
  hasDifficultyLevels,
  activeDifficultyLevel,
  difficultyTabs,
  showLessonsSkeleton,
  showLessonsEmptyState,
  showFilteredLessonsEmpty,
  searchQuery,
  searchedLessonsForActivePart,
  searchedPastLessonsForActivePart,
  showSearchEmptyState,
} = useTeacherProgramLessons(courseId, activePart)

const canEditPart = computed(
  () => displayMode.value === 'custom_sections' && Boolean(activePart.value),
)

type ScheduleFilter = 'all' | 'upcoming' | 'past'

const scheduleFilter = ref<ScheduleFilter>('all')

const scheduleTabs = [
  { id: 'all', label: 'Все' },
  { id: 'upcoming', label: 'Предстоящие' },
  { id: 'past', label: 'Прошедшие' },
]

const visibleLessons = computed(() =>
  scheduleFilter.value === 'past' ? [] : searchedLessonsForActivePart.value,
)

const visiblePastLessons = computed(() =>
  scheduleFilter.value === 'upcoming' ? [] : searchedPastLessonsForActivePart.value,
)

const showScheduleFilterEmpty = computed(
  () =>
    !showLessonsSkeleton.value &&
    scheduleFilter.value !== 'all' &&
    !showLessonsEmptyState.value &&
    visibleLessons.value.length === 0 &&
    visiblePastLessons.value.length === 0,
)

const scheduleFilterEmptyTitle = computed(() =>
  scheduleFilter.value === 'upcoming' ? 'Нет предстоящих занятий' : 'Нет прошедших занятий',
)

const programNotice = ref<string | null>(null)

const setProgramNotice = (message: string | null): void => {
  const trimmed = message?.trim()
  programNotice.value = trimmed && trimmed.length > 0 ? trimmed : null
}

const handleSelectPart = (part: { id: number | string; title: string }): void => {
  setProgramNotice(null)
  scheduleFilter.value = 'all'
  setActivePart(part as (typeof parts.value)[number] | null)
}

const showError = (message: string | null): void => {
  setProgramNotice(message)
  if (message?.trim()) {
    console.error('[TeacherProgram]', message)
  }
}

const handleCreatePart = async (): Promise<void> => {
  showError(await createPart())
}

const handleStartEditingPart = (): void => {
  showError(startEditingPart(activePart.value))
}

const handleSavePart = async (): Promise<void> => {
  showError(await savePart())
}

const handleDeletePart = async (): Promise<void> => {
  showError(await deletePart())
}

const navigateToLessonCreation = (): void => {
  setProgramNotice(null)
  if (!activePart.value?.id) {
    setProgramNotice('Для создания занятия выберите раздел')
    return
  }
  if (!courseStore.createdCourse?.id) {
    setProgramNotice('Сначала сохраните настройки курса')
    return
  }
  router.push({
    name: 'teacher-lesson-create',
    params: { courseId: String(courseStore.createdCourse.id) },
    query: { partId: String(activePart.value.id) },
  })
}

const handleSelectLesson = (lesson: { id: number }): void => {
  if (!courseStore.createdCourse?.id) return
  router.push({
    name: 'teacher-lesson-edit',
    params: {
      courseId: String(courseStore.createdCourse.id),
      lessonId: String(lesson.id),
    },
  })
}

watch(courseId, () => {
  isEditingPart.value = false
})
</script>

<style lang="scss">
@import '@/styles/pages/_teacher_program_view.scss';
</style>
