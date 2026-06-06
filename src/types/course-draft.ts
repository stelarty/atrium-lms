// src/types/course-draft.ts
import type { LmsCourseDisplayMode, LmsCourseSalesMode, LmsCourseSubject } from './course'

/** Настройки черновика курса */
export interface CourseDraftSettings {
  title: string
  subject: LmsCourseSubject | null
  lessonCount: string
  startDate: string | null
  endDate: string | null
  programUrl: string
  hasDifficultyLevels: boolean
  materialsAvailableUntil: string | null
  videoConferenceUrl: string
  salesMode: LmsCourseSalesMode
  monthFrom: string
  partsCount: string
  displayMode: LmsCourseDisplayMode
  allowSectionSplit: boolean
  trialPeriod: boolean
  telegramChatLink: string
  vkChatInviteLink: string
}

/** Заголовок курса */
export interface CourseHeaderState {
  title: string
  accessDate: string
  sectionTitle: string
}

/** Ошибки валидации */
export type CourseFieldErrors = Partial<Record<keyof CourseDraftSettings, string>>
