import type {
  TeacherGradebookDifficultyLevel,
  TeacherGradebookReviewDraft,
  TeacherGradebookReviewResponse,
  TeacherGradebookSubmission,
  TeacherGradebookStudentStatus,
} from '@/types/teacher-gradebook'
import type { BaseChipVariant } from '@/components/base/BaseChip.vue'
import type { MaterialFileItem } from '@/types/file-upload'
import type { WrittenHomeworkFileRef } from '@/types/written-homework-file'
import { parseTeacherGradebookScore } from '@/utils/teacher-gradebook-mapper'

export const TEACHER_GRADEBOOK_STATUS_VARIANTS: Record<
  TeacherGradebookStudentStatus,
  BaseChipVariant
> = {
  not_submitted: 'warning',
  pending_review: 'additional',
  reviewed: 'success',
  overdue: 'neutral',
}

export const TEACHER_GRADEBOOK_TEST_REVIEW_NOTICE =
  'Важно! Чтобы проверить работы, нужно зайти с Google аккаунта, с которого изначально создавалась форма'

export const TEACHER_GRADEBOOK_DIFFICULTY_OPTIONS: Array<{
  value: TeacherGradebookDifficultyLevel
  label: string
}> = [
  { value: 'easy', label: 'Легкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'hard', label: 'Тяжелый' },
]

export function canDownloadTeacherGradebookSubmission(
  submission: TeacherGradebookSubmission,
): boolean {
  return submission.can_download && Boolean(submission.student_work_url)
}

export function canOpenTeacherGradebookReview(
  submission: TeacherGradebookSubmission,
): boolean {
  return submission.status !== 'not_submitted' && submission.status !== 'overdue'
}

export function mapWrittenHomeworkFileToMaterialItem(
  file: WrittenHomeworkFileRef,
  prefix: string,
): MaterialFileItem {
  return {
    clientId: `${prefix}-${file.file_id}`,
    fileId: file.file_id,
    originalName: file.original_file_name,
    extension: file.original_file_name.split('.').pop()?.toUpperCase() ?? 'FILE',
    fileUrl: file.file_url,
    status: 'done',
    progress: 100,
  }
}

export function createTeacherGradebookReviewDraft(
  homeworkMaxScore: string | null,
): TeacherGradebookReviewDraft {
  const parsedMaxScore = parseTeacherGradebookScore(homeworkMaxScore)

  return {
    comment: '',
    withoutScore: false,
    score: '',
    maxScore: parsedMaxScore !== null ? String(parsedMaxScore) : '10',
    reviewFile: null,
    pendingReviewUploadFile: null,
    reviewStatus: null,
  }
}

export function mapTeacherGradebookReviewToDraft(
  review: TeacherGradebookReviewResponse,
): TeacherGradebookReviewDraft {
  const parsedMaxScore = parseTeacherGradebookScore(review.max_score)

  return {
    comment: review.comment ?? '',
    withoutScore: review.no_score,
    score: review.score !== null && review.score !== '' ? String(review.score) : '',
    maxScore: parsedMaxScore !== null ? String(parsedMaxScore) : '10',
    reviewFile: review.review_file
      ? mapWrittenHomeworkFileToMaterialItem(review.review_file, 'review')
      : null,
    pendingReviewUploadFile: null,
    reviewStatus: review.status,
  }
}

export function mapTeacherGradebookTemplateFiles(
  files: Array<{ id: number; original_file_name: string; file_url: string }>,
) {
  return files.map((file) => ({
    clientId: `template-${file.id}`,
    originalName: file.original_file_name,
    extension: file.original_file_name.split('.').pop()?.toUpperCase() ?? 'FILE',
    fileUrl: file.file_url,
    status: 'done' as const,
    progress: 100,
  }))
}
