import type { StudentLessonHomework } from '@/types/student-lesson'
import {
  formatStudentLessonScore,
  getStudentHomeworkStatusMeta,
  getStudentHomeworkStatusMetaFromLabel,
  type StudentHomeworkStatusMeta,
} from '@/utils/student-lesson-labels'

export const resolveStudentHomeworkReviewStatus = (
  homework: Pick<StudentLessonHomework, 'status' | 'submission'>,
): string | null => {
  const submissionStatus = homework.submission?.status?.trim()
  if (submissionStatus) return submissionStatus

  const legacyStatus = homework.status?.trim()
  return legacyStatus || null
}

export const resolveStudentHomeworkStatusMeta = (
  homework: Pick<StudentLessonHomework, 'status' | 'submission'>,
): StudentHomeworkStatusMeta | null => {
  const statusCode = resolveStudentHomeworkReviewStatus(homework)
  const apiStatusLabel = homework.submission?.status_label?.trim() || null

  const metaByCode = getStudentHomeworkStatusMeta(statusCode)
  const metaByLabel =
    !metaByCode && apiStatusLabel ? getStudentHomeworkStatusMetaFromLabel(apiStatusLabel) : null
  const meta = metaByCode ?? metaByLabel

  if (!meta) {
    if (apiStatusLabel) {
      return { label: apiStatusLabel, variant: 'neutral' }
    }
    return null
  }

  return apiStatusLabel ? { ...meta, label: apiStatusLabel } : meta
}

export const resolveStudentHomeworkScoreText = (
  homework: Pick<
    StudentLessonHomework,
    'score' | 'max_score' | 'submission'
  >,
): string | null => {
  const scoreLabel = homework.submission?.score_label?.trim()
  if (scoreLabel) return scoreLabel

  const score = homework.submission?.score ?? homework.score ?? null
  const maxScore = homework.submission?.max_score ?? homework.max_score ?? null

  return formatStudentLessonScore(score, maxScore)
}

/** Test CTA: test_url first, otherwise submission.results_url. */
export const resolveStudentTestHomeworkUrl = (
  homework: Pick<StudentLessonHomework, 'test_url' | 'submission'>,
): string | null => {
  const testUrl = homework.test_url?.trim()
  if (testUrl) return testUrl

  return homework.submission?.results_url?.trim() || null
}

export const resolveStudentHomeworkDeadlineLabel = (
  homework: Pick<StudentLessonHomework, 'deadline' | 'deadline_label'>,
): string | null => {
  return homework.deadline_label?.trim() || homework.deadline?.trim() || null
}

export const isStudentHomeworkOverdue = (
  homework: Pick<StudentLessonHomework, 'status' | 'submission'>,
): boolean => {
  const meta = resolveStudentHomeworkStatusMeta(homework)
  return meta?.variant === 'danger'
}

export const resolveStudentHomeworkReviewerComment = (
  homework: Pick<StudentLessonHomework, 'type' | 'status' | 'submission' | 'reviewer_comment'>,
): string | null => {
  if (homework.type !== 'written') return null

  const status = resolveStudentHomeworkReviewStatus(homework)
  if (status !== 'reviewed') return null

  const comment =
    homework.submission?.reviewer_comment?.trim() ||
    homework.reviewer_comment?.trim() ||
    null

  return comment || null
}

