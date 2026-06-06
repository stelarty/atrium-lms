// src/types/course-part.ts
export interface CoursePartResponse {
  id: number
  title: string
  sort_order: number
}

export interface CreatePartPayload {
  course: number
  title: string
}

export interface UpdatePartPayload {
  title: string
}
