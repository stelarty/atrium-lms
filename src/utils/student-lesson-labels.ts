import type { LmsLessonHomeworkType } from '@/types/lesson'

const HOMEWORK_TYPE_LABELS: Record<Exclude<LmsLessonHomeworkType, 'none'>, string> = {
  written: 'Письменное задание',
  oral: 'Отслушка',
  test: 'Тестовое задание',
}

export const getStudentHomeworkTypeLabel = (
  type: Exclude<LmsLessonHomeworkType, 'none'>,
): string => HOMEWORK_TYPE_LABELS[type] ?? 'Домашнее задание'

/** Variants aligned with `BaseChip` (DS LMS). */
export type StudentHomeworkStatusVariant =
  | 'success'
  | 'warning'
  | 'additional'
  | 'danger'
  | 'neutral'

export interface StudentHomeworkStatusMeta {
  label: string
  variant: StudentHomeworkStatusVariant
}

interface HomeworkStatusDefinition {
  label: string
  variant: Exclude<StudentHomeworkStatusVariant, 'neutral'>
  codes: readonly string[]
  /** `submission.status_label` values from API (normalized match). */
  statusLabels: readonly string[]
}

/**
 * Student homework review statuses — same semantics for written, test, and oral
 * (oral adds `listening_assigned`). Matches course homework filters and BaseChip DS.
 */
const HOMEWORK_STATUS_DEFINITIONS: readonly HomeworkStatusDefinition[] = [
  {
    label: 'Проверено',
    variant: 'success',
    codes: ['checked', 'reviewed', 'graded', 'complete', 'completed'],
    statusLabels: ['проверено'],
  },
  {
    label: 'Требует решения',
    variant: 'additional',
    codes: [
      'requires_solution',
      'require_solution',
      'not_solved',
      'not_submitted',
      'not_started',
      'unsolved',
      'incomplete',
    ],
    statusLabels: ['требует решения'],
  },
  {
    label: 'На проверке',
    variant: 'warning',
    codes: ['pending_review', 'pending', 'submitted', 'on_review', 'awaiting_review', 'in_review'],
    statusLabels: ['на проверке'],
  },
  {
    label: 'Просрочено',
    variant: 'danger',
    codes: ['overdue', 'expired', 'late'],
    statusLabels: ['просрочено'],
  },
  {
    label: 'Назначена отслушка',
    variant: 'additional',
    codes: ['listening_assigned', 'assigned_listening'],
    statusLabels: ['назначена отслушка'],
  },
] as const

const normalizeHomeworkStatusToken = (value: string): string =>
  value.trim().toLowerCase().replace(/-/g, '_')

const CODE_TO_META = new Map<string, StudentHomeworkStatusMeta>()
const LABEL_TO_META = new Map<string, StudentHomeworkStatusMeta>()

for (const definition of HOMEWORK_STATUS_DEFINITIONS) {
  const meta: StudentHomeworkStatusMeta = {
    label: definition.label,
    variant: definition.variant,
  }

  for (const code of definition.codes) {
    CODE_TO_META.set(normalizeHomeworkStatusToken(code), meta)
  }

  for (const statusLabel of definition.statusLabels) {
    LABEL_TO_META.set(normalizeHomeworkStatusToken(statusLabel), meta)
  }

  LABEL_TO_META.set(normalizeHomeworkStatusToken(definition.label), meta)
}

const lookupHomeworkStatusMeta = (token: string | null | undefined): StudentHomeworkStatusMeta | null => {
  if (!token?.trim()) return null

  const normalized = normalizeHomeworkStatusToken(token)
  return CODE_TO_META.get(normalized) ?? LABEL_TO_META.get(normalized) ?? null
}

/**
 * Maps `submission.status` (or legacy `homework.status`) to chip label + variant.
 */
export const getStudentHomeworkStatusMeta = (
  status: string | null | undefined,
): StudentHomeworkStatusMeta | null => lookupHomeworkStatusMeta(status)

/**
 * Maps `submission.status_label` when status code is missing or unknown.
 */
export const getStudentHomeworkStatusMetaFromLabel = (
  statusLabel: string | null | undefined,
): StudentHomeworkStatusMeta | null => lookupHomeworkStatusMeta(statusLabel)

export const getStudentHomeworkSubmitLabel = (
  status: string | null | undefined,
  hasSolutionFile: boolean,
): string | null => {
  const meta = getStudentHomeworkStatusMeta(status)

  if (meta?.variant === 'danger') {
    return null
  }

  if (meta?.variant === 'success') {
    return null
  }

  if (meta?.variant === 'warning' && hasSolutionFile) {
    return 'Отправить другой файл'
  }

  if (meta?.variant === 'warning' || meta?.variant === 'additional') {
    return 'Отправить решение'
  }

  return null
}

export const getStudentHomeworkOralActionLabel = (
  status: string | null | undefined,
): string => {
  const meta = getStudentHomeworkStatusMeta(status)

  if (meta?.variant === 'danger' || meta?.variant === 'additional') {
    return 'Записаться на отслушку'
  }

  return 'Перейти в отслушку'
}

export const formatStudentLessonScore = (
  score: number | string | null | undefined,
  maxScore: string | number | null | undefined,
): string | null => {
  if (score === null || score === undefined || score === '') return null
  if (maxScore === null || maxScore === undefined || maxScore === '') {
    return String(score)
  }

  return `${score} / ${maxScore}`
}
