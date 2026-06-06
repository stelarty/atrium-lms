import type { WrittenHomeworkFileRef } from '@/types/written-homework-file'

export interface StudentHomeworkSubmitSuccess {
  homeworkId: number
  solutionFile: WrittenHomeworkFileRef
  isReplace: boolean
}
