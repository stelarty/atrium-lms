import type {
  StudentCourseHomeworkResponse,
  StudentHomeworkCardViewModel,
  StudentHomeworkLessonGroup,
} from '@/types/student-homework'
import type { StudentLessonHomework } from '@/types/student-lesson'
import type { WrittenHomeworkFileRef } from '@/types/written-homework-file'
import type { MaterialFileItem } from '@/types/file-upload'
import { mapUrlFileToMaterialItem } from '@/utils/material-file'
import {
  getStudentHomeworkOralActionLabel,
  getStudentHomeworkSubmitLabel,
  getStudentHomeworkTypeLabel,
} from '@/utils/student-lesson-labels'
import {
  isStudentHomeworkOverdue,
  resolveStudentHomeworkDeadlineLabel,
  resolveStudentHomeworkReviewStatus,
  resolveStudentHomeworkReviewerComment,
  resolveStudentHomeworkScoreText,
  resolveStudentHomeworkStatusMeta,
  resolveStudentTestHomeworkUrl,
} from '@/utils/student-lesson-homework'

const resolveHomeworkOralActionUrl = (
  homework: StudentLessonHomework & { oral_url?: string | null },
): string | null => homework.oral_url?.trim() || null

function mapWrittenHomeworkFileItem(
  file: WrittenHomeworkFileRef,
  keyPrefix: string,
): MaterialFileItem {
  return mapUrlFileToMaterialItem(
    `${keyPrefix}-${file.file_id}`,
    file.original_file_name,
    file.file_url,
    { fileId: file.file_id, removable: false },
  )
}

export const mapStudentHomeworkToCardViewModel = (
  homework: StudentLessonHomework & {
    oral_url?: string | null
    listening_scheduled_at_label?: string | null
    lesson_id?: number
  },
  index: number,
): StudentHomeworkCardViewModel => {
  const statusMeta = resolveStudentHomeworkStatusMeta(homework)
  const reviewStatus = resolveStudentHomeworkReviewStatus(homework)
  const homeworkKey = `homework-${homework.id ?? index}-${homework.type}`

  const files: MaterialFileItem[] = [
    ...(homework.materials ?? []).map((file, fileIndex) =>
      mapUrlFileToMaterialItem(
        `${homeworkKey}-material-${file.file_id ?? file.file_in_homework_id ?? fileIndex}`,
        file.original_file_name,
        file.file_url,
        { fileId: file.file_id, removable: false },
      ),
    ),
  ]

  if (homework.solution_file) {
    files.push(mapWrittenHomeworkFileItem(homework.solution_file, `${homeworkKey}-solution`))
  }

  if (homework.review_file) {
    files.push(mapWrittenHomeworkFileItem(homework.review_file, `${homeworkKey}-review`))
  }

  const hasSolutionFile = Boolean(homework.solution_file)
  const isTest = homework.type === 'test'
  const isOral = homework.type === 'oral'
  const actionUrl = isTest
    ? resolveStudentTestHomeworkUrl(homework)
    : resolveHomeworkOralActionUrl(homework)
  const isOverdue = isStudentHomeworkOverdue(homework)

  const showOralAction = isOral && Boolean(actionUrl)
  const isSubmissionReplace = reviewStatus === 'pending_review'
  const showSubmitButton =
    homework.type === 'written' &&
    Boolean(getStudentHomeworkSubmitLabel(reviewStatus, hasSolutionFile))

  const listeningInfoLabel =
    isOral ? homework.listening_scheduled_at_label?.trim() || null : null

  const homeworkId = homework.id ?? null
  const lessonId = homework.lesson_id ?? null
  const scoreText = resolveStudentHomeworkScoreText(homework)
  const showFinalScore = Boolean(scoreText) && statusMeta?.variant === 'success'
  const reviewerComment = resolveStudentHomeworkReviewerComment(homework)
  const showReviewFeedback = showFinalScore || Boolean(reviewerComment)

  return {
    key: homeworkKey,
    homeworkId,
    lessonId,
    type: homework.type,
    title: homework.type_label?.trim() || getStudentHomeworkTypeLabel(homework.type),
    deadlineLabel: resolveStudentHomeworkDeadlineLabel(homework),
    isOverdueDeadline: isOverdue,
    statusLabel: statusMeta?.label ?? null,
    statusVariant: statusMeta?.variant ?? null,
    scoreText,
    showFinalScore,
    showReviewFeedback,
    reviewerComment,
    actionUrl,
    actionLabel: isTest
      ? 'Перейти'
      : showOralAction
        ? getStudentHomeworkOralActionLabel(reviewStatus)
        : null,
    showTestButton: isTest,
    showSubmitButton,
    submitButtonLabel: showSubmitButton
      ? getStudentHomeworkSubmitLabel(reviewStatus, hasSolutionFile)
      : null,
    isSubmissionReplace,
    listeningInfoLabel,
    files,
  }
}

export const parseStudentCourseHomeworkResponse = (
  data: StudentCourseHomeworkResponse,
): StudentHomeworkLessonGroup[] =>
  data.lessons.map((lesson) => ({
    lessonId: lesson.id,
    lessonTitle: lesson.title.trim() || 'Занятие',
    items: lesson.homework.map((item, index) =>
      mapStudentHomeworkToCardViewModel({ ...item, lesson_id: lesson.id }, index),
    ),
  }))
