<template>
  <div class="course-view">
    <section v-if="courseStore.error && !courseStore.isLoading" class="section course-view__empty">
      <EmptyPermissions v-if="courseLoadState === 'permissions'" title="Недостаточно прав доступа"
        :subtitle="courseStore.error || 'У вас нет доступа к этому курсу'" />
      <EmptyNoResults v-else :title="courseLoadState === 'not-found' ? 'Курс не найден' : 'Не удалось загрузить курс'"
        :subtitle="courseStore.error" />
    </section>

    <template v-else-if="
      !courseStore.isLoading &&
      !courseStore.hasCourses &&
      !isCreatingCourse &&
      !courseStore.isDraftMode
    ">
      <section class="section course-view__empty">
        <img src="@/assets/images/empty-courses.png" class="course-view__image" />
        <p class="course-view__subtitle">
          Созданных ранее курсов не найдено,<br />давайте создадим первый курс
        </p>
        <BaseButton type="contained" variant="primary" :disabled="isCreatingCourse || courseStore.isLoading"
          @click="handleCreateCourse">
          <UiIcon name="add" size="20" />
          <span>{{ isCreatingCourse ? 'Создание курса...' : 'Создать первый курс' }}</span>
        </BaseButton>
      </section>
    </template>

    <template v-else>
      <section class="section section--no-bg course-view__header">
        <div class="course-view__title-slot">
          <Transition name="slide" mode="out-in" :duration="{ enter: 200, leave: 200 }">
            <Skeleton v-if="courseStore.isLoading" key="skeleton" class="course-view__title-skeleton" type="title"
              size="large" animated />
            <h1 v-else class="course-view__title">{{ course.title }}</h1>
          </Transition>
        </div>

        <div class="course-view__access-slot">
          <Transition name="slide" mode="out-in" :duration="{ enter: 300, leave: 300 }">
            <Skeleton v-if="courseStore.isLoading" class="course-view__access-skeleton" type="text" size="medium"
              animated />
            <p v-else class="course-view__access">Доступно до {{ course.accessDate }}</p>
          </Transition>
        </div>
      </section>

      <WidgetTabBar v-model="activeTab" :items="navItems" />

      <main class="course-view__content">
        <Transition name="slide" mode="out-in" :duration="{ enter: 300, leave: 300 }">
          <component :is="currentComponent" v-bind="{ ...currentViewProps, courseId: currentCourseId }" />
        </Transition>
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import WidgetTabBar from '@/components/widgets/WidgetTabBar.vue'
import type { IconName } from '@/components/ui/UiIcon.vue'
import EmptyNoResults from '@/components/ui/empty/EmptyNoResults.vue'
import EmptyPermissions from '@/components/ui/empty/EmptyPermissions.vue'
import { useTeacherCourseCreation } from '@/composables/useTeacherCourseCreation'
import { useCourseStore } from '@/stores/useCourseStore'
import { useUserStore } from '@/stores/useUserStore'
import TeacherProgramView from './course/TeacherProgramView.vue'
import TeacherScheduleView from './course/TeacherScheduleView.vue'
import TeacherGradeBookView from './course/TeacherGradeBookView.vue'
import TeacherCourseSettingsView from './course/TeacherCourseSettingsView.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

interface CourseTabItem {
  id: string
  label: string
  icon: IconName
}

const { createCourse } = useTeacherCourseCreation()
const courseStore = useCourseStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const isCreatingCourse = ref(false)
const isLoading = ref(true)

const isNew = computed(() => courseStore.isDraftMode || route.name === 'teacher-new-course')

const course = computed(() => courseStore.header)

const courseLoadState = computed<'not-found' | 'permissions' | null>(() => {
  const message = courseStore.error?.toLowerCase() || ''
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
  return route.params.id ? String(route.params.id) : String(courseStore.createdCourse?.id || '')
})

const navItems = ref<CourseTabItem[]>([
  { id: 'program', label: 'Программа', icon: 'listTabBar' },
  { id: 'gradebook', label: 'Журнал', icon: 'journalTabBar' },
  { id: 'settings', label: 'Настройки курса', icon: 'settingsTabBar' },
])

const activeTab = ref(navItems.value[0])

const componentsMap: Record<string, unknown> = {
  program: TeacherProgramView,
  schedule: TeacherScheduleView,
  gradebook: TeacherGradeBookView,
  settings: TeacherCourseSettingsView,
}

const currentComponent = computed(() => {
  const tabId = activeTab.value?.id || 'program'
  return componentsMap[tabId] || TeacherProgramView
})

const currentViewProps = computed(() => {
  const tabId = activeTab.value?.id || 'program'

  if (tabId === 'schedule' || tabId === 'gradebook') {
    return {
      course: courseStore.header,
    }
  }

  return {}
})

const normalizeRouteCourseId = (id: unknown): string | null => {
  if (Array.isArray(id)) return id[0] || null
  if (typeof id !== 'string') return null
  if (!id || id === 'new' || id === 'undefined') return null

  return id
}

const replaceCourseRoute = async (courseId?: string | number): Promise<void> => {
  await router.replace({
    name: 'teacher-course',
    params: courseId ? { id: String(courseId) } : {},
  })
}

const resolveCourseForRoute = async (): Promise<void> => {
  courseStore.isLoading = true

  try {
    if (route.name === 'teacher-new-course' && !courseStore.isDraftMode) {
      await userStore.fetchProfileData()

      const availableCourses = (await courseStore.loadAllCourses()).filter(
        (availableCourse) => availableCourse.id !== undefined && availableCourse.id !== null,
      )

      courseStore.clearCreatedCourse()
      await replaceCourseRoute(availableCourses[0]?.id)
      return
    }

    if (isNew.value) {
      return
    }

    await userStore.fetchProfileData()

    const availableCourses = (await courseStore.loadAllCourses()).filter(
      (availableCourse) => availableCourse.id !== undefined && availableCourse.id !== null,
    )

    if (availableCourses.length === 0) {
      courseStore.clearCreatedCourse()

      if (route.params.id) {
        await replaceCourseRoute()
      }

      return
    }

    const requestedCourseId = normalizeRouteCourseId(route.params.id)
    const targetCourse = requestedCourseId
      ? availableCourses.find((availableCourse) => String(availableCourse.id) === requestedCourseId)
      : availableCourses[0]

    if (requestedCourseId && !targetCourse) {
      await courseStore.loadCourseById(requestedCourseId, true)
      return
    }

    if (!targetCourse?.id) {
      courseStore.clearCreatedCourse()
      return
    }

    if (String(route.params.id || '') !== String(targetCourse.id)) {
      if (String(courseStore.createdCourse?.id || '') !== String(targetCourse.id)) {
        await courseStore.loadCourseById(targetCourse.id)
      }

      await replaceCourseRoute(targetCourse.id)
      return
    }

    if (String(courseStore.createdCourse?.id || '') !== String(targetCourse.id)) {
      await courseStore.loadCourseById(targetCourse.id)
    }
  } catch (error) {
    console.error('[CourseView] Ошибка инициализации курса:', error)
  } finally {
    courseStore.isLoading = false
  }
}

watch(
  () => [route.name, route.params.id, route.query.createdCourse],
  ([newRouteName]) => {
    // Если ушли со страницы создания нового курса — сбрасываем draft режим
    if (newRouteName !== 'teacher-new-course' && courseStore.isDraftMode) {
      courseStore.clearCreatedCourse()
    }
    resolveCourseForRoute()
  },
  { immediate: true },
)

const handleCreateCourse = async () => {
  if (isCreatingCourse.value || isLoading.value) return

  isCreatingCourse.value = true

  try {
    await createCourse()
  } catch (error) {
    console.error('Ошибка при создании первого курса:', error)
  } finally {
    isCreatingCourse.value = false
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/pages/_course_view';
</style>
