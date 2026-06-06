import type { Pinia } from 'pinia'
import { setAccessToken } from '@/auth/accessTokenMemory'
import { useUserStore } from '@/stores/useUserStore'
import { useStudentCourseStore } from '@/stores/useStudentCourseStore'
import { setupApiMocks } from './apiInterceptor'
import {
  MOCK_PROFILE,
  MOCK_STUDENT_COURSES,
  MOCK_COURSE_HEADER,
  MOCK_STUDENT_PROGRAM,
  MOCK_CHAT_LINKS,
  MOCK_USEFUL_MATERIALS,
} from './mockData'

export function setupPrototype(pinia: Pinia): void {
  // 1. Intercept all API calls before anything else
  setupApiMocks()

  // 2. Fake auth token so isAuthenticated === true
  setAccessToken('prototype-mock-token')

  // 3. Role/route cache used by header and HomeRedirect
  localStorage.setItem('role', 'student')
  localStorage.setItem('preferredHomeRoute', '/student')

  // 4. Pre-populate user store
  const userStore = useUserStore(pinia)
  userStore.profile = MOCK_PROFILE
  userStore.isInitialized = true

  // 5. Pre-populate student course store (avoids initial API round-trips)
  const studentCourseStore = useStudentCourseStore(pinia)
  studentCourseStore.allCourses = MOCK_STUDENT_COURSES
  studentCourseStore.isCoursesLoaded = true
  studentCourseStore.courseHeader = MOCK_COURSE_HEADER
  studentCourseStore.program = MOCK_STUDENT_PROGRAM
  studentCourseStore.chatLinks = MOCK_CHAT_LINKS
  studentCourseStore.usefulMaterials = MOCK_USEFUL_MATERIALS
}
