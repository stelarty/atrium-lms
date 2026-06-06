// src/router/index.ts
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUserStore } from '@/stores/useUserStore'
import { isSessionRevoked } from '@/utils/unauthorized'

const isPrototype = import.meta.env.VITE_PROTOTYPE_MODE === 'true'

const router = createRouter({
  history: isPrototype
    ? createWebHashHistory()
    : createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ========== REDIRECT: Главная → Логин ==========
    // {
    //   path: '/',
    //   meta: { requiresAuth: true, role: 'student' },
    //   redirect: '/student',
    // },

    {
      path: '/',
      name: 'home',
      component: () => import('@/views/common/HomeRedirect.vue'),
    },

    // ========== ACCESS LAYOUT ==========
    {
      path: '/access-denied',
      name: 'access-denied',
      component: () => import('@/views/common/AccessDenied.vue'),
    },

    // ========== STUDENT ROUTES ==========
    {
      path: '/student',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true, role: 'student' },
      redirect: '/student',
      children: [
        {
          path: '', // ← index route, срабатывает на /student
          name: 'student-home',
          component: () => import('@/views/student/CourseView.vue'),
        },
        {
          path: 'course/:id',
          name: 'student-course',
          component: () => import('@/views/student/CourseView.vue'),
        },
        {
          path: 'course/:courseId/lessons/:lessonId',
          name: 'student-lesson',
          component: () => import('@/views/student/course/LessonView.vue'),
        },

        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/student/ProfileView.vue'),
        },
      ],
    },

    // ========== TEACHER ROUTES ==========
    {
      path: '/teacher',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true, role: 'teacher' },
      redirect: '/teacher/course',
      children: [
        {
          path: 'course/new',
          name: 'teacher-new-course',
          component: () => import('@/views/teacher/CourseView.vue'),
          props: { isNew: true },
        },
        {
          path: 'course/:id?',
          name: 'teacher-course',
          component: () => import('@/views/teacher/CourseView.vue'),
        },
        {
          path: 'profile',
          name: 'teacher-profile',
          component: () => import('@/views/student/ProfileView.vue'),
        },
        // src/router/index.ts
        {
          path: 'course/:courseId/lessons/new',
          name: 'teacher-lesson-create',
          component: () => import('@/views/teacher/course/TeacherLessonFormView.vue'),
        },

        {
          path: 'course/:courseId/lessons/:lessonId/edit',
          name: 'teacher-lesson-edit',
          component: () => import('@/views/teacher/course/TeacherLessonFormView.vue'),
        },
      ],
    },

    // ========== AUTH HANDLER ==========
    {
      path: '/auth-handler',
      name: 'authHandler',
      component: () => import('@/views/auth/AuthHandler.vue'),
    },
    {
      path: '/logout-handler',
      name: 'logoutHandler',
      component: () => import('@/views/auth/LogoutHandler.vue'),
    },
    {
      path: '/auth/callback',
      name: 'AuthCallback',
      component: () => import('@/views/auth/AuthCallback.vue'),
    },
    {
      path: '/email_change_confirm/:uid/:token/',
      name: 'email-change-confirm',
      component: () => import('@/views/auth/EmailChangeConfirmView.vue'),
    },

    // ========== DEV PREVIEW (без авторизации, только для localhost) ==========
    {
      path: '/dev-preview',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { devPreview: true },
      children: [
        {
          path: 'student/homework/:courseId',
          name: 'dev-preview-student-homework',
          component: () => import('@/views/student/course/HomeworkView.vue'),
          props: (route) => ({
            courseId: route.params.courseId,
          }),
        },
        {
          path: 'student/lesson/:courseId/:lessonId',
          name: 'dev-preview-student-lesson',
          component: () => import('@/views/student/course/LessonView.vue'),
          props: (route) => ({
            courseId: route.params.courseId,
            lessonId: route.params.lessonId,
          }),
        },
        {
          path: 'teacher/gradebook/:courseId',
          name: 'dev-preview-teacher-gradebook',
          component: () => import('@/views/teacher/course/TeacherGradeBookView.vue'),
          props: (route) => ({
            courseId: route.params.courseId,
          }),
        },
      ],
    },

    // ========== 404 ==========
    {
      path: '/not-found',
      name: 'not-found',
      component: () => import('@/views/common/NotFound.vue'),
    },

    // ========== 503 ==========
    {
      path: '/service-unavailable',
      name: 'service-unavailable',
      component: () => import('@/views/common/ServiceUnavailable.vue'),
    },

    // ========== CATCH-ALL ==========
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found-catchall',
      redirect: '/not-found',
    },
  ],
})

// Глобальный навигационный хук

router.beforeEach(async (to) => {
  // В прототипе пропускаем все проверки
  if (isPrototype) return true

  const authStore = useAuthStore()
  const userStore = useUserStore()

  // Локальный preview UI без cookie-auth (см. /dev-preview/* в routes)
  if (to.meta.devPreview === true || to.path.startsWith('/dev-preview')) {
    return true
  }

  // const userRole = localStorage.getItem('role') as 'student' | 'teacher' | null

  // Если маршрут требует авторизации
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated || isSessionRevoked()) {
      return '/access-denied'
    }

    // Только для /student — проверяем курсы
    if (to.path.startsWith('/student')) {
      // Ждём полной загрузки профиля
      try {
        if (isSessionRevoked()) return '/access-denied'
        await userStore.fetchProfileData()
      } catch {
        // 🔥 Ловим ошибку API → сервис недоступен
        return '/service-unavailable'
      }

      // 🔁 Теперь profile.value гарантированно обновлён
      if (!userStore.profile?.courses?.length) {
        return '/access-denied'
      }
    }

    // Проверка роли
    if (to.meta.role && userStore.profile) {
      const actualRole = userStore.profile.is_staff ? 'teacher' : 'student'
      if (actualRole !== to.meta.role) {
        return '/access-denied'
      }
    }
  }

  // Защита: если авторизован и есть курсы — не должен быть на /access-denied
  if (to.name === 'access-denied' && authStore.isAuthenticated && !isSessionRevoked()) {
    try {
      await userStore.fetchProfileData()
      if (userStore.profile?.courses?.length) {
        const targetRoute = userStore.profile.is_staff ? '/teacher' : '/student'

        // ✅ КЛЮЧЕВОЕ: не редиректить, если уже на целевом маршруте
        if (to.path !== targetRoute && !to.path.startsWith(`${targetRoute}/course/`)) {
          return targetRoute
        }
        return true
      }
    } catch {
      return '/service-unavailable'
    }
  }
})

router.afterEach(() => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
})

export default router
