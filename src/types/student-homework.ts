import type { MaterialFileItem } from '@/types/file-upload'
import type { LmsLessonHomeworkType } from '@/types/lesson'
import type { StudentLessonHomework } from '@/types/student-lesson'
import type { StudentHomeworkStatusVariant } from '@/utils/student-lesson-labels'

/** Query `status` for GET …/lms-courses/:id/homework/ */
export type StudentHomeworkFilterStatus =
  | 'not_submitted'
  | 'overdue'
  | 'pending_review'
  | 'reviewed'

export interface StudentCourseHomeworkComponent {
  id: number
  title: string
}

export interface StudentCourseHomeworkLesson {
  id: number
  title: string
  homework: StudentLessonHomework[]
}

/** GET /edspace/student/lms-courses/:courseId/homework/ */
export interface StudentCourseHomeworkResponse {
  component: StudentCourseHomeworkComponent
  status: StudentHomeworkFilterStatus
  lessons: StudentCourseHomeworkLesson[]
}

export interface StudentHomeworkCardViewModel {
  key: string
  homeworkId: number | null
  lessonId: number | null
  type: Exclude<LmsLessonHomeworkType, 'none'>
  title: string
  deadlineLabel: string | null
  isOverdueDeadline: boolean
  statusLabel: string | null
  statusVariant: StudentHomeworkStatusVariant | null
  scoreText: string | null
  showFinalScore: boolean
  showReviewFeedback: boolean
  reviewerComment: string | null
  actionUrl: string | null
  actionLabel: string | null
  showTestButton: boolean
  showSubmitButton: boolean
  submitButtonLabel: string | null
  /** PATCH submission when true (pending_review), POST otherwise. */
  isSubmissionReplace: boolean
  listeningInfoLabel: string | null
  files: MaterialFileItem[]
}

export interface StudentHomeworkLessonGroup {
  lessonId: number
  lessonTitle: string
  items: StudentHomeworkCardViewModel[]
}

export interface FetchStudentCourseHomeworkParams {
  componentId: number | string
  status: StudentHomeworkFilterStatus
}
