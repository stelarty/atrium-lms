import type {
  TeacherGradebookDetail,
  TeacherGradebookFilterHomework,
  TeacherGradebookFilterLesson,
  TeacherGradebookHomeworkDetailResponse,
  TeacherGradebookMaterial,
  TeacherGradebookStudentResponse,
  TeacherGradebookSubmission,
} from '@/types/teacher-gradebook'

export function parseTeacherGradebookScore(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value.trim() === '') return null
  const parsed = Number(value.replace(',', '.'))
  return Number.isNaN(parsed) ? null : parsed
}

export function formatTeacherGradebookStudentName(
  surname: string,
  name: string,
): string {
  return [surname, name].filter(Boolean).join(' ').trim()
}

export function mapTeacherGradebookStudent(
  student: TeacherGradebookStudentResponse,
  maxScore: number | null,
): TeacherGradebookSubmission {
  return {
    user_id: student.user_id,
    full_name: formatTeacherGradebookStudentName(student.surname, student.name),
    email: student.email,
    status: student.status,
    status_label: student.status_label,
    score_label: student.score_label,
    score: parseTeacherGradebookScore(student.score),
    max_score: maxScore,
    student_work_url: student.student_work_url,
    can_download: student.can_download,
  }
}

type TeacherGradebookMaterialLike = Partial<TeacherGradebookMaterial> & {
  file_id?: number
  name?: string
  url?: string
}

export function normalizeTeacherGradebookMaterials(
  materials: TeacherGradebookMaterialLike[] | null | undefined,
): TeacherGradebookMaterial[] {
  if (!Array.isArray(materials)) return []

  return materials
    .map((material) => ({
      id: material.id ?? material.file_id ?? 0,
      original_file_name: material.original_file_name ?? material.name ?? 'Файл',
      file_url: material.file_url ?? material.url ?? '',
    }))
    .filter((material) => Boolean(material.file_url))
}

export function mapTeacherGradebookDetail(
  response: TeacherGradebookHomeworkDetailResponse,
): TeacherGradebookDetail {
  const maxScore = parseTeacherGradebookScore(response.homework.max_score)

  return {
    homework: {
      ...response.homework,
      materials: normalizeTeacherGradebookMaterials(response.homework.materials),
    },
    students: response.students.map((student) =>
      mapTeacherGradebookStudent(student, maxScore),
    ),
  }
}

export function formatTeacherGradebookHomeworkOptionLabel(
  homework: TeacherGradebookFilterHomework,
  lesson: TeacherGradebookFilterLesson,
): string {
  const sameTypeCount = lesson.homework.filter((item) => item.type_label === homework.type_label)
    .length

  if (sameTypeCount > 1) {
    return `${homework.type_label} (#${homework.id})`
  }

  return homework.type_label
}
