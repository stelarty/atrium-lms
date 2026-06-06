// src/types/profile.ts

export interface Achievement {
  id?: number
  image_url: string
  title: string
  description: string
  is_received: boolean
}

export interface Course {
  course_id: number
  course_name: string
  status: 'active' | 'inactive' | 'completed' | 'expired'
  /** Student subscription end; null for staff/teachers on owned courses. */
  access_until: string | null
  /** Materials window end (API: course_materials_until). */
  course_materials_until: string | null
  extension_available?: boolean
}

export interface ProfileData {
  role: string
  email: string
  name: string
  surname: string
  grade: string
  phone: string
  is_staff: boolean
  /** Если false у ученика — клиент запрашивает GET /edspace/onboarding/ и ведёт виджет онбординга */
  onboarding_done?: boolean
  achievements: Achievement[]
  courses: Course[]
  extension_available: boolean
}

export interface EditProfilePayload {
  name: string
  surname: string
  grade: string
  phone: string
  email?: string
}

export interface ChangeEmailPayload {
  new_email: string
  url_from?: 'lms'
}

export interface ChangePasswordPayload {
  old_password: string
  new_password: string
}

export interface ConfirmEmailChangeResult {
  success: boolean
  message?: string
}