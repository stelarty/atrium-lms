export type LmsLessonType = 'live' | 'recording' | 'no_video'
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | null
export type LmsLessonHomeworkType = 'test' | 'oral' | 'written' | 'none'
export type HomeworkDraftType = LmsLessonHomeworkType

export interface LmsLessonMaterialFile {
  /** File id for PATCH materials[] (LMSLessonMaterialFile.id). */
  id?: number
  /** @deprecated Legacy alias; prefer id. */
  file_id?: number
  original_file_name: string
  file_url: string
  uploaded_at?: string
  file_in_lesson_id?: number | null
  sort_order?: number | null
  size_bytes?: number
}

export interface LessonFileDraft {
  id: string
  title: string
  file?: File
  objectUrl?: string
  backendId?: number
  fileUrl?: string
}

export interface LmsLessonHomeworkPayload {
  type: Exclude<LmsLessonHomeworkType, 'none'>
  deadline: string
  max_score: string
  test_url?: string
  materials?: number[]
}

export interface LmsLessonHomeworkFile {
  file_id: number
  file_in_homework_id: number | null
  original_file_name: string
  file_url: string
}

export interface LmsLessonHomeworkResponse {
  id: number
  type: Exclude<LmsLessonHomeworkType, 'none'>
  test_url?: string | null
  deadline: string
  max_score: string | number
  materials: LmsLessonHomeworkFile[]
}

export interface LmsLessonCreatePayload {
  course: number
  part: number
  section?: number | null
  title: string
  duration_minutes: number
  lesson_type: LmsLessonType
  date?: string
  time?: string
  lesson_url?: string | null
  recording_url?: string | null
  difficulty_level?: DifficultyLevel
  materials?: number[]
  homework?: LmsLessonHomeworkPayload[]
  teacher_comment?: string | null
}

export interface LmsLessonUpdatePayload extends Partial<Omit<LmsLessonCreatePayload, 'course'>> {
  materials?: number[]
}

export interface LmsLessonResponse extends Omit<LmsLessonCreatePayload, 'materials' | 'homework'> {
  id: number
  starts_at?: string
  materials?: LmsLessonMaterialFile[]
  homework?: LmsLessonHomeworkResponse[]
}

export interface CourseProgramLesson {
  id: number
  title: string
  starts_at: string | null
  starts_at_label: string | null
  ends_at?: string | null
  difficulty_level?: string | null
  difficulty_level_label?: string | null
  status?: 'live' | 'upcoming' | null
  homework?: LmsLessonHomeworkResponse[]
}

export interface CourseProgramComponent {
  id: number
  title: string
  sort_order: number
  lessons: CourseProgramLesson[]
  past_lessons?: CourseProgramLesson[]
}

export interface CourseProgramResponse {
  id: number
  title: string
  display_mode: string
  components: CourseProgramComponent[]
}

export type CourseProgramApiResponse = CourseProgramResponse | CourseProgramComponent[]
