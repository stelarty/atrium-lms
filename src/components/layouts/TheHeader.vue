<!-- src/components/layouts/TheHeader.vue -->
<template>
  <header class="header">
    <div class="container header__inner">
      <nav class="header__nav">
        <!-- Logo: ведёт на dashboard по роли -->
        <RouterLink :to="homePath" class="header__logo" aria-label="Atrium LMS Home">
          <IconLogo :size="100" />
          <img v-if="userRole === 'teacher'" src="@/assets/images/for-teacher.png" alt="for-teacher"
            class="header__logo-image">
        </RouterLink>

        <!-- Right Side -->
        <div class="header__actions">
          <!-- ========== COURSES (Context Menu) ========== -->
          <!-- Student: Context Menu for Courses -->

          <WidgetContextMenu v-if="userRole === 'student'" position="right">
            <template #trigger="{ opened }">
              <BaseButton variant="secondary" type="contained" :class="{ 'header__dropdown-trigger--opened': opened }">
                Мои курсы
                <UiIcon name="arrow" :direction="opened ? 'up' : 'down'" size="16" />
              </BaseButton>
            </template>

            <template #menu-items>
              <ul class="widget-context-menu__menu-list">
                <li v-for="course in studentCourses" :key="course.id" class="widget-context-menu__menu-item" :class="{
                  'widget-context-menu__menu-item--active': currentCourseId === course.id,
                }" @click="selectCourse(course.id)">
                  {{ course.label }}
                </li>
              </ul>
            </template>
          </WidgetContextMenu>

          <!-- Teacher: Context Menu for Courses -->
          <WidgetContextMenu v-else-if="userRole === 'teacher'" position="right">
            <template #trigger="{ opened }">
              <BaseButton variant="secondary" type="contained" :class="{ 'header__dropdown-trigger--opened': opened }">
                Мои курсы
                <UiIcon name="arrow" :direction="opened ? 'up' : 'down'" size="16" />
              </BaseButton>
            </template>

            <template #menu-items>
              <div class="widget-context-menu--primary">
                <ul class="widget-context-menu__menu-list">
                  <li v-for="course in teacherCourses" :key="course.id" class="widget-context-menu__menu-item" :class="{
                    'widget-context-menu__menu-item--active': currentCourseId === course.id,
                  }" @click="selectCourse(course.id)">
                    {{ course.label }}
                  </li>
                </ul>
                <BaseButton variant="primary" type="contained" :disabled="isCreatingCourse" @click="createNewCourse"
                  width="full">
                  <UiIcon name="add" size="18" />
                  Создать новый курс
                </BaseButton>
              </div>
            </template>
          </WidgetContextMenu>

          <!-- Calendar -->
          <!-- <BaseButton :to="calendarPath" variant="secondary" type="contained">
            Календарь
          </BaseButton> -->

          <!-- ========== NOTIFICATIONS (Context Menu) ========== -->
          <!-- <WidgetContextMenu position="right" class="header__context-menu">
            <template #trigger="{ opened }">
              <BaseIconButton
                variant="secondary"
                type="contained"
                :class="{ 'header__dropdown-trigger--opened': opened }"
              >
                <UiIcon name="notification" :size="24" />
              </BaseIconButton>
            </template>

            <div class="header__menu-items">
              <button
                v-for="notif in notifications"
                :key="notif.id"
                class="header__menu-item"
                @click="handleNotification(notif.id)"
              >
                <div class="header__menu-item-content">
                  <span class="header__menu-item-label">{{ notif.label }}</span>
                </div>
              </button>
            </div>
          </WidgetContextMenu> -->

          <a v-if="!isAuthenticated" :href="loginUrl" class="login-button"> Войти </a>
          <BaseIconButton v-else :to="profilePath" variant="secondary" type="contained">
            <UiIcon name="person" :size="24" />
          </BaseIconButton>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
// import { useUserStore } from '@/stores/useUserStore'
import { useTeacherCourseCreation } from '@/composables/useTeacherCourseCreation'
import { useCourseStore } from '@/stores/useCourseStore'
import { useStudentCourseStore } from '@/stores/useStudentCourseStore'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseIconButton from '@/components/base/BaseIconButton.vue'
import WidgetContextMenu from '../widgets/WidgetContextMenu.vue'
import UiIcon from '../ui/UiIcon.vue'
import IconLogo from '@/assets/icons/IconLogo.vue'

const authStore = useAuthStore()
// const userStore = useUserStore()
const courseStore = useCourseStore()
const studentCourseStore = useStudentCourseStore()
const { createCourse } = useTeacherCourseCreation()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isCreatingCourse = ref(false)

const loginUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_PUBLIC_API_BASE_URL || 'https://test-potok.atriumolymp.com'
  return `${baseUrl}/auth/login?redirect=${encodeURIComponent(window.location.origin)}`
})

const route = useRoute()
const router = useRouter()

// 🧠 Временно: роль из localStorage (в будущем — из store)
const userRole = computed((): 'student' | 'teacher' => {
  return (localStorage.getItem('role') as 'student' | 'teacher' | null) || 'student'
})

// 🏠 Главная страница в зависимости от роли
const homePath = computed(() => {
  if (userRole.value === 'student') {
    const firstCourse = studentCourseStore.allCourses[0]
    if (firstCourse?.id) return `/student/course/${firstCourse.id}`
    return '/student'
  }
  if (userRole.value === 'teacher') {
    const firstCourse = courseStore.allCourses[0]
    if (firstCourse?.id) return `/teacher/course/${firstCourse.id}`
    return '/teacher/course'
  }
  return '/'
})

// 📅 Календарь
// const calendarPath = computed(() => {
//   return `/${userRole.value}/calendar`
// })

// 👤 Профиль в зависимости от роли
const profilePath = computed(() => {
  return `/${userRole.value}/profile`
})

// === COURSES DATA ===
interface CourseItem {
  id: string
  label: string
}

const studentCourses = computed((): CourseItem[] => {
  if (!studentCourseStore.isCoursesLoaded) return []

  return studentCourseStore.allCourses.map((course) => ({
    id: String(course.id),
    label: course.title,
  }))
})

const teacherCourses = computed((): { id: string; label: string }[] => {
  if (!courseStore.isCoursesLoaded) return []
  return courseStore.allCourses.map((course) => ({
    id: String(course.id),
    label: course.title,
  }))
})

const currentCourseId = computed(() => {
  return String(route.params.id || courseStore.createdCourse?.id || '')
})

// interface NotificationItem {
//   id: string
//   label: string
// }

// const notifications = computed((): NotificationItem[] => {
// Пока нет уведомлений в userData, показываем пустой список
// TODO: добавить поле notifications в userData
// return []
// })

// === HANDLERS ===
const selectCourse = (courseId: string) => {
  router.push(`/${userRole.value}/course/${courseId}`)
}

const createNewCourse = async () => {
  if (userRole.value !== 'teacher' || isCreatingCourse.value) return

  isCreatingCourse.value = true

  try {
    await createCourse()
    // await router.push({
    //   path: `/${userRole.value}/course`,
    //   query: { createdCourse: Date.now().toString() },
    // })
  } catch (error) {
    console.error('Ошибка при создании курса из хедера:', error)
  } finally {
    isCreatingCourse.value = false
  }
}

</script>

<style scoped lang="scss">
@import '@/styles/components/_layout-header';

.header__dropdown {
  :deep(.widget-dropdown__trigger-wrapper) {
    padding: 0;
  }
}
</style>
