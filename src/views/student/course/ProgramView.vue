<!-- src/views/student/course/StudentProgramView.vue -->
<template>
  <div ref="outerRef" class="student-program-view">
    <img
      v-if="hasPastLessons"
      ref="dinoImgRef"
      class="program-dino"
      :style="{ top: dinoTop + 'px' }"
      :src="dinoSrc"
      aria-hidden="true"
    />
    <Transition name="slide" mode="out-in" :duration="{ enter: 400, leave: 400 }">
      <Skeleton v-if="showProgramSkeleton" key="skeleton" type="section" size="full" animated />

      <section v-else key="content" class="section program">
        <template v-if="components.length > 0">
          <BaseBanner
            class="program__info-banner"
            title="Что делать с пропусками?"
            description="Если вы пропустили какое-то занятие, вы можете посмотреть его в записи"
            :sessionDismissKey="programInfoBannerDismissKey || undefined"
            ariaLabel="Справка о программе занятий"
            :imageSrc="goodLuckImage"
          />

          <div class="program__topline">
            <WidgetPartSelector :parts="components" :activePart="activeComponent"
              :displayMode="studentCourseStore.program?.display_mode" @select="handleSelectComponent" />

            <BaseInput v-model="searchQuery" class="program__search" type="search" placeholder="Поиск..." />
          </div>

          <div class="program__filters">
            <WidgetSegmentControl v-model="scheduleFilter" :tabs="scheduleTabs" />

            <div v-if="hasDifficultyLevels" class="program__difficulty">
              <span class="program__difficulty-label">Уровень</span>
              <WidgetSegmentControl v-model="activeDifficultyLevel" :tabs="difficultyTabs" />
            </div>
          </div>

          <Transition name="fade" mode="out-in">
            <ProgramLessonList
              v-if="activeComponent && !showLessonsEmptyState && !showFilteredLessonsEmpty && !showSearchEmptyState && !showScheduleFilterEmpty"
              ref="programListRef"
              key="lessons"
              :lessons="visibleLessons"
              :pastLessons="visiblePastLessons"
              :isLoading="isSwitching"
              @select="handleSelectLesson"
            />

            <StudentCourseEmptyState
              v-else-if="showLessonsEmptyState"
              key="empty"
              title="Похоже, курс ещё не начался, и занятий пока нет"
              subtitle="Дождитесь, пока преподаватель добавит материал"
              :imageSrc="lessonsEmptyImage"
              imageAlt="Занятий пока нет"
            />

            <EmptyCreateFirst v-else-if="showFilteredLessonsEmpty" key="filtered-empty"
              title="Нет занятий на выбранном уровне" subtitle="Выберите другой уровень сложности" />

            <EmptyNoResults v-else-if="showSearchEmptyState" key="no-results" title="Результатов не найдено" />

            <EmptyCreateFirst v-else-if="showScheduleFilterEmpty" key="schedule-empty"
              :title="scheduleFilterEmptyTitle" subtitle="Попробуйте выбрать другой фильтр" />
          </Transition>
        </template>

        <StudentCourseEmptyState
          v-else
          title="Похоже, курс ещё не начался, и занятий пока нет"
          subtitle="Дождитесь, пока преподаватель добавит материал"
          :imageSrc="lessonsEmptyImage"
          imageAlt="Занятий пока нет"
        />
      </section>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseInput from '@/components/base/BaseInput.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import EmptyCreateFirst from '@/components/ui/empty/EmptyCreateFirst.vue'
import EmptyNoResults from '@/components/ui/empty/EmptyNoResults.vue'
import WidgetPartSelector from '@/components/widgets/WidgetPartSelector.vue'
import WidgetSegmentControl from '@/components/widgets/WidgetSegmentControl.vue'
import dinoSrc from '@/assets/images/dino.svg'
import goodLuckImage from '@/assets/images/good-luck.png'
import lessonsEmptyImage from '@/assets/images/lessons-emty.png'
import { useStudentCourseStore } from '@/stores/useStudentCourseStore'
import { useStudentProgram } from '@/composables/useStudentProgram'
import type { StudentProgramComponent } from '@/types/student-course'
import ProgramLessonList from '@/views/teacher/course/_program/ProgramLessonList.vue'
import StudentCourseEmptyState from './_shared/StudentCourseEmptyState.vue'
import BaseBanner from '@/components/base/BaseBanner.vue'

const props = defineProps<{
  courseId?: string | number
}>()

const route = useRoute()
const router = useRouter()
const studentCourseStore = useStudentCourseStore()

const currentCourseId = computed(() => {
  const id = props.courseId ?? route.params.id
  return Array.isArray(id) ? id[0] : id
})

const programInfoBannerDismissKey = computed(() => {
  const id = currentCourseId.value
  if (id === undefined || id === null || id === '') return ''
  return `lms:student:program-info-banner:dismissed:${String(id)}`
})

const {
  activeComponent,
  activeDifficultyLevel,
  difficultyTabs,
  searchQuery,
  components,
  hasDifficultyLevels,
  searchedLessonsForActiveComponent,
  searchedPastLessonsForActiveComponent,
  showProgramSkeleton,
  showLessonsEmptyState,
  showFilteredLessonsEmpty,
  showSearchEmptyState,
  setActiveComponent,
} = useStudentProgram(currentCourseId)

const scheduleFilter = ref('all')
const isSwitching = ref(false)
let switchTimer: ReturnType<typeof setTimeout> | null = null

watch(scheduleFilter, () => {
  if (switchTimer) clearTimeout(switchTimer)
  isSwitching.value = true
  switchTimer = setTimeout(() => { isSwitching.value = false }, 800)
}, { flush: 'sync' })

const scheduleTabs = [
  { id: 'all', label: 'Все' },
  { id: 'upcoming', label: 'Предстоящие' },
  { id: 'past', label: 'Прошедшие' },
]

const visibleLessons = computed(() =>
  scheduleFilter.value === 'past' ? [] : searchedLessonsForActiveComponent.value,
)

const visiblePastLessons = computed(() =>
  scheduleFilter.value === 'upcoming' ? [] : searchedPastLessonsForActiveComponent.value,
)

const showScheduleFilterEmpty = computed(
  () =>
    !showProgramSkeleton.value &&
    !isSwitching.value &&
    scheduleFilter.value !== 'all' &&
    !showLessonsEmptyState.value &&
    visibleLessons.value.length === 0 &&
    visiblePastLessons.value.length === 0,
)

const scheduleFilterEmptyTitle = computed(() =>
  scheduleFilter.value === 'upcoming' ? 'Нет предстоящих занятий' : 'Нет прошедших занятий',
)

function handleSelectComponent(component: { id: number | string; title: string }): void {
  setActiveComponent(component as StudentProgramComponent)
  scheduleFilter.value = 'all'
}

const outerRef = ref<HTMLElement | null>(null)
const dinoImgRef = ref<HTMLElement | null>(null)
const programListRef = ref<InstanceType<typeof ProgramLessonList> | null>(null)
const dinoTop = ref(0)

const hasPastLessons = computed(() => visiblePastLessons.value.length > 0)

function updateDinoPosition() {
  const pastEl = programListRef.value?.pastRef
  const outerEl = outerRef.value
  if (!pastEl || !outerEl) return

  let top = 0
  let cur: HTMLElement | null = pastEl
  while (cur && cur !== outerEl) {
    top += cur.offsetTop
    cur = cur.offsetParent as HTMLElement | null
  }
  dinoTop.value = top + 16
}

onMounted(() => nextTick().then(updateDinoPosition))
watch([activeComponent, activeDifficultyLevel, searchQuery, scheduleFilter], () => nextTick().then(updateDinoPosition))

function handleSelectLesson(lesson: { id: number }): void {
  if (!currentCourseId.value) return

  router.push({
    name: 'student-lesson',
    params: {
      courseId: String(currentCourseId.value),
      lessonId: String(lesson.id),
    },
  })
}
</script>

<style lang="scss">
@import '@/styles/pages/_program-view.shared.scss';

.student-program-view {
  width: 100%;
  position: relative;
}

.program-dino {
  position: absolute;
  left: -44px;
  z-index: 0;
  pointer-events: none;
}

.program {
  position: relative;
  z-index: 1;

  &__topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $m6;
    flex-wrap: wrap;
  }

  &__search {
    width: 100%;
    max-width: none;
  }

  @include screen-min('md') {
    &__search {
      max-width: 220px;
    }
  }
}
</style>
