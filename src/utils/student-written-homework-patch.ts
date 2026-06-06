import type { StudentHomeworkCardViewModel } from '@/types/student-homework'
import type { StudentLessonHomework } from '@/types/student-lesson'
import type { WrittenHomeworkFileRef } from '@/types/written-homework-file'
import { mapStudentHomeworkToCardViewModel } from '@/utils/student-homework'

export function buildPendingReviewHomeworkPatch(
  existing: StudentLessonHomework,
  solutionFile: WrittenHomeworkFileRef,
): StudentLessonHomework {
  const maxScore = existing.submission?.max_score ?? existing.max_score ?? '10'
  const maxScoreLabel = String(maxScore)

  return {
    ...existing,
    solution_file: solutionFile,
    review_file: null,
    submission: {
      status: 'pending_review',
      status_label: 'На проверке',
      score: null,
      max_score: maxScoreLabel,
      score_label: `— / ${maxScoreLabel}`,
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      results_url: null,
    },
  }
}

export function mapHomeworkToCardAfterSubmission(
  homework: StudentLessonHomework,
  lessonId: number | null,
  previousKey: string,
  index: number,
): StudentHomeworkCardViewModel {
  const card = mapStudentHomeworkToCardViewModel(
    { ...homework, lesson_id: lessonId ?? undefined },
    index,
  )
  return { ...card, key: previousKey }
}
