// composables/useStudentShellWidgets.ts
import { computed } from 'vue'
import { useRoute } from 'vue-router'

/** Student shell chrome (banners, onboarding): not on profile, only under /student. */
export function useStudentShellWidgets() {
  const route = useRoute()

  return computed(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('role') !== 'student') {
      return false
    }
    const path = route.path
    if (!path.startsWith('/student')) return false
    if (path.startsWith('/student/profile')) return false

    return true
  })
}
