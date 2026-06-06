import type { StudentLessonDetail, StudentLessonMediaMode } from '@/types/student-lesson'
import {
  hasStudentLessonSchedule,
  parseStudentLessonDateTime,
  shouldShowStudentLessonRecordingBlock,
} from '@/utils/student-lesson-recording'

export const resolveStudentLessonMediaMode = (
  lesson: StudentLessonDetail,
): StudentLessonMediaMode | null => {
  if (shouldShowStudentLessonRecordingBlock(lesson)) {
    return null
  }

  if (!hasStudentLessonSchedule(lesson)) {
    return null
  }

  const now = Date.now()
  const startMs = parseStudentLessonDateTime(lesson.starts_at)
  const endMs = parseStudentLessonDateTime(lesson.ends_at)

  if (!Number.isNaN(startMs) && !Number.isNaN(endMs) && now >= startMs && now <= endMs) {
    return 'live'
  }

  if (!Number.isNaN(startMs) && now < startMs) {
    return 'scheduled'
  }

  if (lesson.starts_at_label?.trim()) {
    return 'scheduled'
  }

  return null
}

/** Верхний медиа-блок (запись / эфир) на странице занятия. */
export const shouldShowStudentLessonMediaBlock = (lesson: StudentLessonDetail): boolean => {
  if (shouldShowStudentLessonRecordingBlock(lesson)) {
    return true
  }

  return resolveStudentLessonMediaMode(lesson) !== null
}

export const getStudentLessonInfoChipLabel = (mode: StudentLessonMediaMode): string => {
  if (mode === 'live') {
    return 'Занятие в прямом эфире'
  }

  return 'Занятие запланировано'
}
