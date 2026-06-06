import type { MaterialFileItem } from './file-upload'
import type { DifficultyLevel, HomeworkDraftType, LmsLessonType } from './lesson'

export interface LessonDraft {
  course: number
  part: number | null
  section: number | null
  title: string
  duration_minutes: string
  lesson_type: LmsLessonType
  date: string | null
  time: string
  lesson_url: string
  recording_url: string
  difficulty_level: DifficultyLevel
  teacher_comment: string
}

export interface HomeworkDraft {
  id: string
  type: HomeworkDraftType
  url: string
  deadline_date: string | null
  deadline_time: string
  points: string
  files: MaterialFileItem[]
}
