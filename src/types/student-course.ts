import type { LmsCourseDisplayMode, LmsCoursePart } from './course'

export interface StudentCourseHeader {
  id: number
  title: string
  access_until: string
  has_difficulty_levels: boolean
}

export interface StudentProgramLesson {
  id: number
  title: string
  starts_at?: string | null
  starts_at_label: string | null
  ends_at?: string | null
  difficulty_level?: 'easy' | 'medium' | 'hard' | null
  difficulty_level_label?: string | null
}

export interface StudentProgramComponent extends Pick<
  LmsCoursePart,
  'id' | 'title' | 'sort_order'
> {
  lessons: StudentProgramLesson[]
  /** Lessons that have already ended (shown below upcoming in the student program). */
  past_lessons?: StudentProgramLesson[]
}

export interface StudentProgram {
  id: number
  title: string
  display_mode: LmsCourseDisplayMode
  components: StudentProgramComponent[]
}

export interface StudentProgramLessonViewModel extends StudentProgramLesson {
  starts_at: string | null
  status: 'live' | 'upcoming' | null
}

export interface StudentCourseChatLinks {
  telegram: string | null
  vk: string | null
}

export interface StudentUsefulMaterial {
  id: number
  order: number
  original_file_name: string
  file_url: string
}

export interface StudentUsefulMaterialsTeacher {
  id: number
  first_name: string
  last_name: string
  patronymic: string
  achievements: string[]
  titles: string[]
  photo_url: string | null
  subject: string
}

export interface StudentUsefulMaterialsResponse {
  useful_materials: StudentUsefulMaterial[]
  teachers: StudentUsefulMaterialsTeacher[]
}
