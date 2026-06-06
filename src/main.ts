import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUserStore } from '@/stores/useUserStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { useStudentCourseStore } from '@/stores/useStudentCourseStore'
import { isAuthSyncRoute, isSessionRevoked } from '@/utils/unauthorized'
import { setupAuthInterceptors } from '@/auth/setupAuthInterceptors'
import { isAuthV2Enabled } from '@/auth/authConfig'
import '@/styles/globals.scss'

async function bootstrap(): Promise<void> {
  const pinia = createPinia()

  if (import.meta.env.VITE_PROTOTYPE_MODE === 'true') {
    const { setupPrototype } = await import('./prototype/setup')
    setupPrototype(pinia)
  } else {
    const authStore = useAuthStore(pinia)
    authStore.initializeAuth()

    if (isAuthV2Enabled()) {
      setupAuthInterceptors(() => authStore.clearSession())
      await authStore.bootstrap()
    }

    if (!isAuthSyncRoute() && authStore.isAuthenticated && !isSessionRevoked()) {
      const userStore = useUserStore(pinia)
      const courseStore = useCourseStore(pinia)
      const studentCourseStore = useStudentCourseStore(pinia)

      await userStore.fetchProfileData()

      if (userStore.profile?.is_staff) {
        courseStore.loadAllCourses()
      } else {
        studentCourseStore.loadAllCourses()
      }
    }
  }

  createApp(App).use(pinia).use(router).mount('#app')
}

bootstrap()
