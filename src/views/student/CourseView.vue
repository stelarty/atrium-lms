<!-- src/views/student/CourseView.vue -->
<template>
  <div class="course-view">
    <section v-if="studentCourseStore.error && !studentCourseStore.isLoading" class="section course-view__empty">
      <EmptyPermissions v-if="courseLoadState === 'permissions'" title="Недостаточно прав доступа"
        :subtitle="studentCourseStore.error || 'У вас нет доступа к этому курсу'" />
      <EmptyNoResults v-else :title="courseLoadState === 'not-found' ? 'Курс не найден' : 'Не удалось загрузить курс'"
        :subtitle="studentCourseStore.error" />
    </section>

    <template v-else>
      <!-- <Teleport to="body"> -->
      <div v-if="showOnboardingHost" class="course-view__onboarding-host">
        <WidgetOnboarding />
      </div>
      <!-- </Teleport> -->

      <section class="section section--no-bg course-view__header">
        <div class="course-view__title-slot">
          <Transition name="slide" mode="out-in" :duration="{ enter: 200, leave: 200 }">
            <Skeleton v-if="studentCourseStore.isLoading" key="skeleton-title" class="course-view__title-skeleton"
              type="title" size="large" animated />
            <h1 v-else key="title" class="course-view__title">{{ courseHeader?.title || '' }}</h1>
          </Transition>
        </div>

        <div class="course-view__access-slot">
          <Transition name="slide" mode="out-in" :duration="{ enter: 300, leave: 300 }">
            <Skeleton v-if="studentCourseStore.isLoading" key="skeleton-access" class="course-view__access-skeleton"
              type="text" size="medium" animated />
            <p v-else key="access" class="course-view__access">
              Доступен до: {{ courseHeader?.access_until || '' }}
            </p>
          </Transition>
        </div>
      </section>

      <WidgetTabBar v-if="hasActiveCourse" v-model="activeTab" :items="navItems" />

      <main v-if="hasActiveCourse" class="course-view__content">
        <Transition name="slide" mode="out-in" :duration="{ enter: 300, leave: 300 }">
          <component :is="currentComponent" :key="currentContentKey"
            v-bind="{ ...currentViewProps, courseId: currentCourseId }" />
        </Transition>
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WidgetTabBar from '@/components/widgets/WidgetTabBar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import EmptyNoResults from '@/components/ui/empty/EmptyNoResults.vue'
import EmptyPermissions from '@/components/ui/empty/EmptyPermissions.vue'
import { useStudentCourseStore } from '@/stores/useStudentCourseStore'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import StudentProgramView from './course/ProgramView.vue'
import StudentScheduleView from './course/ScheduleView.vue'
import StudentProgressView from './course/ProgressView.vue'
import StudentHomeworkView from './course/HomeworkView.vue'
import StudentResourcesView from './course/ResourcesView.vue'
import type { IconName } from '@/components/ui/UiIcon.vue'
import WidgetOnboarding from '@/components/widgets/WidgetOnboarding.vue'
import { useStudentShellWidgets } from '@/composables/useStudentShellWidgets'
import { prefetchStudentCourseTabImages } from '@/utils/prefetch-student-course-images'

interface CourseTabItem {
  id: string
  label: string
  icon: IconName
}

const route = useRoute()
const router = useRouter()
const studentCourseStore = useStudentCourseStore()

const navItems = ref<CourseTabItem[]>([
  { id: 'program', label: 'Программа', icon: 'listTabBar' },
  { id: 'schedule', label: 'Расписание', icon: 'calendarTabBar' },
  { id: 'progress', label: 'Прогресс', icon: 'fireTabBar' },
  { id: 'homework', label: 'Домашние задания', icon: 'clockTabBar' },
  { id: 'resources', label: 'Полезные материалы', icon: 'folderTabBar' },
])

const activeTab = ref(navItems.value[0])

const onboardingStore = useOnboardingStore()
const showStudentShellWidgets = useStudentShellWidgets()

const showOnboardingHost = computed(
  () => showStudentShellWidgets.value && onboardingStore.shouldMountWidget,
)

watch(
  () => activeTab.value?.id,
  (tabId) => {
    if (tabId === 'resources') {
      void onboardingStore.reportJoinedTelegramIfEligible()
    }
  },
)

const componentsMap: Record<string, unknown> = {
  program: StudentProgramView,
  schedule: StudentScheduleView,
  progress: StudentProgressView,
  homework: StudentHomeworkView,
  resources: StudentResourcesView,
}

const currentComponent = computed(() => {
  const tabId = activeTab.value?.id || 'program'
  return componentsMap[tabId] || StudentProgramView
})

const currentContentKey = computed(() => {
  const tabId = activeTab.value?.id || 'program'
  return `${tabId}-${currentCourseId.value || 'empty'}`
})

const currentViewProps = computed(() => {
  const tabId = activeTab.value?.id || 'program'

  if (tabId === 'program') {
    return {
      courseId: currentCourseId.value,
    }
  }

  if (tabId === 'resources') {
    return {
      course: studentCourseStore.courseHeader,
      courseId: currentCourseId.value,
    }
  }

  if (tabId !== 'program' && tabId !== 'resources') {
    return {
      course: studentCourseStore.courseHeader,
    }
  }

  return {}
})

const courseHeader = computed(() => studentCourseStore.courseHeader)
const courseLoadState = computed<'not-found' | 'permissions' | null>(() => {
  const message = studentCourseStore.error?.toLowerCase() || ''
  if (!message) return null

  if (message.includes('не существует') || message.includes('не найден')) {
    return 'not-found'
  }

  if (
    message.includes('доступ') ||
    message.includes('прав') ||
    message.includes('staff') ||
    message.includes('авторизован')
  ) {
    return 'permissions'
  }

  return null
})
const currentCourseId = computed(() => {
  const routeId = normalizeRouteCourseId(route.params.id)
  return routeId ?? String(studentCourseStore.courseHeader?.id || '')
})
const hasActiveCourse = computed(() => Boolean(currentCourseId.value))

const normalizeRouteCourseId = (id: unknown): string | null => {
  if (Array.isArray(id)) return id[0] || null
  if (typeof id !== 'string') return null
  if (!id || id === 'undefined') return null

  return id
}

const replaceCourseRoute = async (courseId?: string | number): Promise<void> => {
  if (!courseId) return

  await router.replace({
    name: 'student-course',
    params: { id: String(courseId) },
  })
}

const resolveCourseForRoute = async (): Promise<void> => {
  try {
    const availableCourses = await studentCourseStore.loadAllCourses()

    if (availableCourses.length === 0) {
      studentCourseStore.clearCourse()
      studentCourseStore.error = 'Доступных курсов не найдено'
      return
    }

    const requestedCourseId = normalizeRouteCourseId(route.params.id)
    const targetCourse = requestedCourseId
      ? availableCourses.find((course) => String(course.id) === requestedCourseId)
      : availableCourses[0]

    if (requestedCourseId && !targetCourse) {
      await studentCourseStore.loadCourse(requestedCourseId, true)
      return
    }

    if (!targetCourse?.id) {
      studentCourseStore.clearCourse()
      return
    }

    if (String(route.params.id || '') !== String(targetCourse.id)) {
      if (String(studentCourseStore.courseHeader?.id || '') !== String(targetCourse.id)) {
        await studentCourseStore.loadCourse(targetCourse.id)
      }

      await replaceCourseRoute(targetCourse.id)
      return
    }

    if (String(studentCourseStore.courseHeader?.id || '') !== String(targetCourse.id)) {
      await studentCourseStore.loadCourse(targetCourse.id)
    }
  } catch (error) {
    console.error('[StudentCourseView] Ошибка инициализации курса:', error)
  }
}

watch(
  () => [route.name, route.params.id],
  () => {
    resolveCourseForRoute()
  },
  { immediate: true },
)

onMounted(() => {
  prefetchStudentCourseTabImages()
})
</script>

<style scoped lang="scss">
@import '@/styles/pages/_course_view';
</style>
