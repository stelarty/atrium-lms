import type { LmsLessonHomeworkType } from './lesson'
import type { WrittenHomeworkFileRef } from '@/types/written-homework-file'

/** GET /edspace/student/lms-lessons/:id/ */
export interface StudentLessonMaterial {
  id?: number
  original_file_name: string
  file_url: string
  order?: number
  sort_order?: number
}

export interface StudentLessonHomeworkFile {
  file_id?: number
  file_in_homework_id?: number | null
  original_file_name: string
  file_url: string
}

/** Submission block from GET /edspace/student/lms-lessons/:id/ */
export interface StudentLessonHomeworkSubmission {
  status?: string | null
  status_label?: string | null
  score?: string | number | null
  max_score?: string | number | null
  score_label?: string | null
  submitted_at?: string | null
  reviewed_at?: string | null
  results_url?: string | null
  reviewer_comment?: string | null
}

export interface StudentLessonHomework {
  id?: number
  type: Exclude<LmsLessonHomeworkType, 'none'>
  type_label: string
  deadline: string
  deadline_label: string
  max_score?: string | number
  score?: number | string | null
  status?: string | null
  test_url?: string | null
  oral_url?: string | null
  listening_scheduled_at?: string | null
  listening_scheduled_at_label?: string | null
  submission?: StudentLessonHomeworkSubmission | null
  submission_code?: string | null
  materials?: StudentLessonHomeworkFile[]
  solution_file?: WrittenHomeworkFileRef | null
  review_file?: WrittenHomeworkFileRef | null
  reviewer_comment?: string | null
}

export interface StudentLessonDetail {
  id: number
  title: string
  description?: string | null
  starts_at: string | null
  ends_at: string | null
  starts_at_label: string | null
  lesson_url: string | null
  recording_url?: string | null
  homework: StudentLessonHomework[]
  materials: StudentLessonMaterial[]
  teacher_comment?: string | null
}

export type StudentLessonMediaMode = 'scheduled' | 'live'
