import type { StudentLessonDetail } from '@/types/student-lesson'

export const parseStudentLessonDateTime = (value: string | null | undefined): number => {
  if (value == null || value === '') {
    return Number.NaN
  }

  return Date.parse(value)
}

/** Эфир: в ответе студента есть пара starts_at + ends_at. */
export const hasStudentLessonSchedule = (lesson: StudentLessonDetail): boolean => {
  const startMs = parseStudentLessonDateTime(lesson.starts_at)
  const endMs = parseStudentLessonDateTime(lesson.ends_at)
  return !Number.isNaN(startMs) && !Number.isNaN(endMs)
}

export const isStudentLessonLiveEnded = (
  lesson: StudentLessonDetail,
  now = Date.now(),
): boolean => {
  const endMs = parseStudentLessonDateTime(lesson.ends_at)
  return !Number.isNaN(endMs) && now > endMs
}

export const isStudentLessonLiveActive = (
  lesson: StudentLessonDetail,
  now = Date.now(),
): boolean => {
  const startMs = parseStudentLessonDateTime(lesson.starts_at)
  const endMs = parseStudentLessonDateTime(lesson.ends_at)
  return (
    !Number.isNaN(startMs) && !Number.isNaN(endMs) && now >= startMs && now <= endMs
  )
}

export const isStudentLessonBeforeStart = (
  lesson: StudentLessonDetail,
  now = Date.now(),
): boolean => {
  const startMs = parseStudentLessonDateTime(lesson.starts_at)
  return !Number.isNaN(startMs) && now < startMs
}

/**
 * Student API does not expose lesson_type. Inference:
 * - With schedule: recording block only after live ends and recording_url is set.
 * - Without schedule: lesson_url or recording_url → «Запись»; neither → no media block.
 */
export const resolveStudentLessonRecordingUrl = (lesson: StudentLessonDetail): string => {
  const recordingUrl = lesson.recording_url?.trim() || ''
  const lessonUrl = lesson.lesson_url?.trim() || ''

  if (hasStudentLessonSchedule(lesson)) {
    if (isStudentLessonLiveEnded(lesson) && recordingUrl) {
      return recordingUrl
    }

    return ''
  }

  return lessonUrl || recordingUrl
}

export const shouldShowStudentLessonRecordingBlock = (lesson: StudentLessonDetail): boolean => {
  return Boolean(resolveStudentLessonRecordingUrl(lesson))
}

export const formatStudentLessonRecordingLinkLabel = (url: string): string => {
  const trimmed = url.trim()
  if (!trimmed) return ''

  try {
    const parsed = new URL(trimmed)
    const path = parsed.pathname.replace(/^\/+/, '')
    const host = parsed.hostname.replace(/^www\./, '')
    const suffix = path ? `/${path}` : ''
    const label = `${host}${suffix}`

    return label.length > 48 ? `${label.slice(0, 45)}…` : label
  } catch {
    return trimmed.length > 48 ? `${trimmed.slice(0, 45)}…` : trimmed
  }
}
