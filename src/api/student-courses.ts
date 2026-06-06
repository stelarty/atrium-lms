// src/api/student-courses.ts
import { api } from './index'
import type {
  StudentCourseChatLinks,
  StudentCourseHeader,
  StudentProgram,
  StudentUsefulMaterialsResponse,
} from '@/types/student-course'

/**
 * Получить список курсов (студент).
 * @returns массив курсов
 */
export async function fetchStudentCourses(): Promise<StudentCourseHeader[]> {
  try {
    const response = await api.get('/edspace/student/lms-courses/')
    return response.data
  } catch (error) {
    console.error('[Courses API] Ошибка получения списка курсов:', error)
    throw error
  }
}

/**
 * Получить шапку курса для студента
 * @param courseId ID курса
 */
export async function fetchStudentCourseHeader(courseId: number | string): Promise<StudentCourseHeader> {
  try {
    const response = await api.get(`/edspace/student/lms-courses/${courseId}/`)
    return response.data
  } catch (error) {
    console.error('[Student Courses API] Ошибка получения шапки курса:', error)
    throw error
  }
}

/**
 * Получить программу курса для студента
 * @param courseId ID курса
 */
export async function fetchStudentProgram(courseId: number | string): Promise<StudentProgram> {
  try {
    const response = await api.get(`/edspace/student/program/${courseId}/`)
    return response.data
  } catch (error) {
    console.error('[Student Courses API] Ошибка получения программы курса:', error)
    throw error
  }
}

/**
 * Получить ссылки на чаты курса для студента.
 * Используется в полезных материалах и будущих баннерах.
 */
export async function fetchStudentCourseChatLinks(
  courseId: number | string,
): Promise<StudentCourseChatLinks> {
  try {
    const response = await api.get(`/edspace/student/lms-courses/${courseId}/chat-links/`)
    return response.data
  } catch (error) {
    console.error('[Student Courses API] Ошибка получения ссылок на чаты:', error)
    throw error
  }
}

/**
 * Получить полезные материалы и преподавателей курса.
 */
export async function fetchStudentUsefulMaterials(
  courseId: number | string,
): Promise<StudentUsefulMaterialsResponse> {
  try {
    const response = await api.get(`/edspace/student/lms-courses/${courseId}/useful-materials/`)
    return response.data
  } catch (error) {
    console.error('[Student Courses API] Ошибка получения полезных материалов:', error)
    throw error
  }
}
