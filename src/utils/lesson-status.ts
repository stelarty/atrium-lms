export type LessonCardStatus = 'live' | 'upcoming'

export interface TimedLesson {
  id: number
  starts_at?: string | null
  ends_at?: string | null
}

export interface LessonWithStatus extends TimedLesson {
  starts_at: string | null
  status: LessonCardStatus | null
}

function resolveStartsAt(lesson: TimedLesson): string | null {
  return lesson.starts_at ?? null
}

function parseLessonDate(value?: string | null): Date | null {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function isLessonLive(lesson: TimedLesson, now: Date): boolean {
  const start = parseLessonDate(resolveStartsAt(lesson))
  const end = parseLessonDate(lesson.ends_at)

  if (!start || !end) return false

  return start.getTime() <= now.getTime() && now.getTime() < end.getTime()
}

function isLessonUpcoming(lesson: TimedLesson, now: Date): boolean {
  const start = parseLessonDate(resolveStartsAt(lesson))
  return start ? start.getTime() > now.getTime() : false
}

export function withLessonStatuses<T extends TimedLesson>(lessons: T[], now = new Date()): Array<T & LessonWithStatus> {
  const upcomingLesson = lessons.find((lesson) => isLessonUpcoming(lesson, now))
  const upcomingLessonId = upcomingLesson?.id ?? null

  return lessons.map((lesson) => ({
    ...lesson,
    starts_at: resolveStartsAt(lesson),
    status: isLessonLive(lesson, now)
      ? 'live'
      : lesson.id === upcomingLessonId
        ? 'upcoming'
        : null,
  }))
}
