import type { LmsCourseDisplayMode } from '@/types/course'
import type { DifficultyLevel } from '@/types/lesson'
import type { MaterialFileItem } from '@/types/file-upload'
import type { WrittenHomeworkFileRef } from '@/types/written-homework-file'

export type TeacherGradebookHomeworkType = 'written' | 'oral' | 'test'

export type TeacherGradebookStudentStatus =
  | 'not_submitted'
  | 'overdue'
  | 'pending_review'
  | 'reviewed'

export type TeacherGradebookDifficultyLevel = Exclude<DifficultyLevel, null>

export interface TeacherGradebookDifficultyOption {
  id: TeacherGradebookDifficultyLevel
  label: string
}

export interface TeacherGradebookFilterHomework {
  id: number
  type: TeacherGradebookHomeworkType
  type_label: string
}

export interface TeacherGradebookFilterLesson {
  id: number
  title: string
  difficulty_level_id: DifficultyLevel | null
  difficulty_level_label: string | null
  homework: TeacherGradebookFilterHomework[]
}

export interface TeacherGradebookFilterComponent {
  id: number
  title: string
  sort_order: number
  lessons: TeacherGradebookFilterLesson[]
}

export interface TeacherGradebookFiltersResponse {
  id: number
  title: string
  display_mode: LmsCourseDisplayMode
  has_difficulty_levels: boolean
  difficulty_levels: TeacherGradebookDifficultyOption[] | null
  homework_type_labels: Record<string, string> | string[]
  components: TeacherGradebookFilterComponent[]
}

export interface TeacherGradebookMaterial {
  id: number
  original_file_name: string
  file_url: string
}

export interface TeacherGradebookHomeworkHeader {
  id: number
  lesson_id: number
  lesson_title: string
  type: TeacherGradebookHomeworkType
  type_label: string
  deadline: string | null
  deadline_label: string
  max_score: string | null
  test_url: string | null
  materials: TeacherGradebookMaterial[]
  show_student_work_download: boolean
  show_review_action: boolean
}

export interface TeacherGradebookStudentResponse {
  user_id: string
  name: string
  surname: string
  email: string | null
  status: TeacherGradebookStudentStatus
  status_label: string
  score: string | null
  score_label: string
  student_work_url: string | null
  can_download: boolean
}

export interface TeacherGradebookHomeworkDetailResponse {
  homework: TeacherGradebookHomeworkHeader
  students: TeacherGradebookStudentResponse[]
}

/** View-model for table rows and review modal */
export interface TeacherGradebookSubmission {
  user_id: string
  full_name: string
  email: string | null
  status: TeacherGradebookStudentStatus
  status_label: string
  score_label: string
  score: number | null
  max_score: number | null
  student_work_url: string | null
  can_download: boolean
}

export interface TeacherGradebookDetail {
  homework: TeacherGradebookHomeworkHeader
  students: TeacherGradebookSubmission[]
}

export type TeacherGradebookReviewStatus = 'pending_review' | 'reviewed'

export interface TeacherGradebookReviewResponse {
  user_id: string
  student_work: WrittenHomeworkFileRef
  review_file: WrittenHomeworkFileRef | null
  comment: string
  score: string | null
  max_score: string
  no_score: boolean
  status: TeacherGradebookReviewStatus
}

export interface TeacherGradebookReviewSaveBody {
  review_file_id?: number | null
  comment?: string
  score?: string | null
  no_score?: boolean
}

export interface TeacherGradebookReviewPayload {
  homework_id: number
  user_id: string
  method: 'POST' | 'PATCH'
  body: TeacherGradebookReviewSaveBody
}

export interface TeacherGradebookReviewDraft {
  comment: string
  withoutScore: boolean
  score: string
  maxScore: string
  reviewFile: MaterialFileItem | null
  /** Local file selected in modal; uploaded on save. */
  pendingReviewUploadFile: File | null
  reviewStatus: TeacherGradebookReviewStatus | null
}
