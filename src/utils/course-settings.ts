import type { CourseDraftSettings, CourseFieldErrors } from '@/types/course-draft'
import type { LmsCourseCreatePayload, LmsCourseResponse } from '@/types/course'

export function formatCourseAccessDate(value: string | null): string {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function createDefaultCourseDraft(): CourseDraftSettings {
  return {
    title: '',
    subject: null,
    lessonCount: '',
    startDate: null,
    endDate: null,
    programUrl: '',
    hasDifficultyLevels: false,
    materialsAvailableUntil: null,
    videoConferenceUrl: '',
    salesMode: 'blocks',
    monthFrom: '',
    partsCount: '1',
    displayMode: 'sales_parts',
    allowSectionSplit: false,
    trialPeriod: false,
    telegramChatLink: '',
    vkChatInviteLink: '',
  }
}

function isAllowedUrl(value: string, allowedHosts: string[]): boolean {
  try {
    const url = new URL(value)
    const hostname = url.hostname.toLowerCase()

    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      allowedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))
    )
  } catch {
    return false
  }
}

export function validateCourseDraft(draftSettings: CourseDraftSettings): CourseFieldErrors {
  const fieldErrors: CourseFieldErrors = {}

  if (!draftSettings.title.trim()) fieldErrors.title = 'Введите название курса'
  if (!draftSettings.subject) fieldErrors.subject = 'Выберите предмет'
  if (!draftSettings.lessonCount.toString().trim()) {
    fieldErrors.lessonCount = 'Укажите количество занятий'
  }
  if (!draftSettings.startDate) fieldErrors.startDate = 'Выберите дату начала'
  if (!draftSettings.endDate) fieldErrors.endDate = 'Выберите дату конца'

  if (!draftSettings.materialsAvailableUntil) {
    fieldErrors.materialsAvailableUntil = 'Выберите дату доступа к материалам'
  }

  if (!draftSettings.videoConferenceUrl.trim()) {
    fieldErrors.videoConferenceUrl = 'Укажите ссылку на онлайн-трансляцию'
  }

  if (draftSettings.partsCount && !String(draftSettings.partsCount).trim()) {
    fieldErrors.partsCount = 'Укажите количество частей'
  }

  if (!draftSettings.telegramChatLink.trim()) {
    fieldErrors.telegramChatLink = 'Укажите ссылку на учебную группу в Телеграм'
  } else if (!isAllowedUrl(draftSettings.telegramChatLink, ['t.me', 'telegram.me'])) {
    fieldErrors.telegramChatLink = 'Введите корректную ссылку на Телеграм'
  }

  if (!draftSettings.vkChatInviteLink.trim()) {
    fieldErrors.vkChatInviteLink = 'Укажите ссылку на учебную группу в VK'
  } else if (!isAllowedUrl(draftSettings.vkChatInviteLink, ['vk.me', 'vk.com'])) {
    fieldErrors.vkChatInviteLink = 'Введите корректную ссылку на VK'
  }

  const lessonCount = Number(draftSettings.lessonCount)
  if (draftSettings.lessonCount.toString().trim() && (!Number.isFinite(lessonCount) || lessonCount <= 0)) {
    fieldErrors.lessonCount = 'Количество занятий должно быть больше нуля'
  }

  const partsCount = Number(draftSettings.partsCount)
  if (draftSettings.partsCount.toString().trim() && (!Number.isFinite(partsCount) || partsCount < 1)) {
    fieldErrors.partsCount = 'Количество частей должно быть не меньше 1'
  }

  if (draftSettings.salesMode === 'months') {
    const monthFrom = Number(draftSettings.monthFrom)
    if (!draftSettings.monthFrom.toString().trim()) {
      fieldErrors.monthFrom = 'Укажите стартовый месяц'
    } else if (!Number.isFinite(monthFrom) || monthFrom < 1 || monthFrom > 12) {
      fieldErrors.monthFrom = 'Месяц должен быть в диапазоне от 1 до 12'
    }
  }

  return fieldErrors
}

function normalizeCoursePayload<T extends Partial<LmsCourseCreatePayload>>(payload: T): T {
  const normalizedPayload = { ...payload }

  Object.keys(normalizedPayload).forEach((key) => {
    const payloadKey = key as keyof T
    if (normalizedPayload[payloadKey] === undefined || normalizedPayload[payloadKey] === '') {
      delete normalizedPayload[payloadKey]
    }
  })

  return normalizedPayload
}

export function buildCourseCreatePayload(draftSettings: CourseDraftSettings): LmsCourseCreatePayload {
  const payload: LmsCourseCreatePayload = {
    title: draftSettings.title.trim(),
    subject: draftSettings.subject as LmsCourseCreatePayload['subject'],
    sales_mode: draftSettings.salesMode,
    parts_count: Number(draftSettings.partsCount),
    trial_period: draftSettings.trialPeriod,
    display_mode: draftSettings.allowSectionSplit ? 'custom_sections' : 'sales_parts',
    program_url: draftSettings.programUrl.trim() || '',
    lesson_count: Number(draftSettings.lessonCount),
    has_difficulty_levels: draftSettings.hasDifficultyLevels,
    start_date: draftSettings.startDate || '',
    end_date: draftSettings.endDate || '',
    materials_available_until: draftSettings.materialsAvailableUntil || '',
    video_conference_url: draftSettings.videoConferenceUrl.trim(),
    telegram_chat_link: draftSettings.telegramChatLink.trim(),
    vk_chat_invite_link: draftSettings.vkChatInviteLink.trim(),
    month_from:
      draftSettings.salesMode === 'months' && draftSettings.monthFrom
        ? Number(draftSettings.monthFrom)
        : null,
  }

  return normalizeCoursePayload(payload)
}

export function buildCourseUpdatePayload(
  draftSettings: CourseDraftSettings,
): Partial<LmsCourseCreatePayload> {
  return {
    title: draftSettings.title.trim() || undefined,
    subject: draftSettings.subject || undefined,
    sales_mode: draftSettings.salesMode,
    parts_count: Number(draftSettings.partsCount) || undefined,
    trial_period: draftSettings.trialPeriod,
    display_mode: draftSettings.allowSectionSplit ? 'custom_sections' : 'sales_parts',
    lesson_count: Number(draftSettings.lessonCount) || undefined,
    has_difficulty_levels: draftSettings.hasDifficultyLevels,
    start_date: draftSettings.startDate || undefined,
    end_date: draftSettings.endDate || undefined,
    materials_available_until: draftSettings.materialsAvailableUntil || undefined,
    video_conference_url: draftSettings.videoConferenceUrl.trim() || undefined,
    telegram_chat_link: draftSettings.telegramChatLink.trim() || undefined,
    vk_chat_invite_link: draftSettings.vkChatInviteLink.trim() || undefined,
    month_from:
      draftSettings.salesMode === 'months' && draftSettings.monthFrom
        ? Number(draftSettings.monthFrom)
        : null,
  }
}

export function mergeCourseResponseWithPayload(
  response: LmsCourseResponse,
  payload: Partial<LmsCourseCreatePayload>,
): LmsCourseResponse {
  return {
    ...payload,
    ...response,
    sales_mode: response.sales_mode ?? payload.sales_mode,
    parts_count: response.parts_count ?? payload.parts_count,
    month_from: response.month_from ?? payload.month_from,
    trial_period: response.trial_period ?? payload.trial_period,
    display_mode: response.display_mode ?? payload.display_mode,
    has_difficulty_levels: response.has_difficulty_levels ?? payload.has_difficulty_levels,
  } as LmsCourseResponse
}

export function getCoursePartsCountValue(course: LmsCourseResponse): string {
  if (course.parts_count !== undefined && course.parts_count !== null) {
    return String(course.parts_count)
  }

  if (course.parts?.length) {
    return String(Math.max(1, course.parts.length))
  }

  return '1'
}

export function mapCourseToDraftSettings(course: LmsCourseResponse): Partial<CourseDraftSettings> {
  return {
    title: course.title,
    subject: course.subject,
    lessonCount: String(course.lesson_count),
    startDate: course.start_date,
    endDate: course.end_date,
    programUrl: course.program_url || '',
    hasDifficultyLevels: course.has_difficulty_levels,
    materialsAvailableUntil: course.materials_available_until,
    videoConferenceUrl: course.video_conference_url || '',
    salesMode: course.sales_mode  || 'blocks',
     monthFrom: course.month_from ? String(course.month_from) : '',
    partsCount: String(course.parts_count || '1'),
    // monthFrom: course.month_from ? String(course.month_from) : '',
    // partsCount: getCoursePartsCountValue(course),
    displayMode: course.display_mode,
    allowSectionSplit: course.display_mode === 'custom_sections',
    trialPeriod: Boolean(course.trial_period),
    telegramChatLink: course.telegram_chat_link || '',
    vkChatInviteLink: course.vk_chat_invite_link || '',
  }
}
