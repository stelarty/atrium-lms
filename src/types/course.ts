export type LmsCourseSubject = 'biology' | 'chemistry' | 'mathematics'
export type LmsCourseSalesMode = 'blocks' | 'months'
export type LmsCourseDisplayMode = 'sales_parts' | 'custom_sections'

export interface LmsCoursePart {
  id: number
  title: string
  sort_order: number
}

export interface LmsCourseSection { 
  id: number
  title: string
  sort_order?: number
}

export interface LmsCourseMaterial {
  file_id: number
  file_in_course_id: number | null
  original_file_name: string
  file_url: string
}

export interface LmsCourseCreatePayload {
  title: string
  subject: LmsCourseSubject
  sales_mode: LmsCourseSalesMode
  parts_count: number
  trial_period: boolean
  program_url: string
  display_mode: LmsCourseDisplayMode
  lesson_count: number
  has_difficulty_levels: boolean
  start_date: string
  end_date: string
  materials_available_until: string
  video_conference_url: string
  telegram_chat_link: string
  vk_chat_invite_link: string
  month_from?: number | null
  materials?: number[]
}

export interface LmsCourseResponse extends Omit<LmsCourseCreatePayload, 'materials'> {
  id?: number | string
  parts: LmsCoursePart[]
  materials?: LmsCourseMaterial[]
  allow_section_split?: boolean
}

export interface LmsCourseComponentsResponse extends LmsCourseResponse {
  sections?: LmsCourseSection[]
}
