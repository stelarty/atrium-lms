import { ref, toValue, type MaybeRefOrGetter } from 'vue'
import {
  createStudentHomeworkSubmission,
  updateStudentHomeworkSubmission,
} from '@/api/student-homework-submission'
import {
  studentWrittenHomeworkFileUploadComplete,
  studentWrittenHomeworkFileUploadInit,
} from '@/api/student-written-homework-files'
import { uploadToS3 } from '@/api/s3-upload'
import type { StudentHomeworkSubmitSuccess } from '@/types/student-homework-submit'
import type { WrittenHomeworkFileUploadCompleteResponse } from '@/types/written-homework-file'
import {
  DEFAULT_MAX_UPLOAD_FILE_SIZE_BYTES,
  resolveUploadFileErrorMessage,
  validateWrittenHomeworkFileExtension,
  validateWrittenHomeworkFileSize,
} from '@/utils/written-homework-file'

export function useStudentHomeworkSubmit(options: {
  courseId: MaybeRefOrGetter<number | string | undefined>
  onSuccess?: (payload: StudentHomeworkSubmitSuccess) => void | Promise<void>
}) {
  const fileInputRef = ref<HTMLInputElement | null>(null)
  const pendingHomeworkId = ref<number | null>(null)
  const pendingReplaceSubmission = ref(false)
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)
  const activeHomeworkId = ref<number | null>(null)

  const openSubmitPicker = (
    homeworkId: number,
    replaceSubmission: boolean,
  ): void => {
    if (isSubmitting.value) return

    pendingHomeworkId.value = homeworkId
    pendingReplaceSubmission.value = replaceSubmission
    activeHomeworkId.value = homeworkId
    error.value = null
    fileInputRef.value?.click()
  }

  const uploadSolutionFile = async (
    courseId: number,
    file: File,
  ): Promise<WrittenHomeworkFileUploadCompleteResponse> => {
    const extensionError = validateWrittenHomeworkFileExtension(file.name)
    if (extensionError) {
      throw new Error(extensionError)
    }

    const clientSizeError = validateWrittenHomeworkFileSize(
      file.size,
      DEFAULT_MAX_UPLOAD_FILE_SIZE_BYTES,
    )
    if (clientSizeError) {
      throw new Error(clientSizeError)
    }

    const initData = await studentWrittenHomeworkFileUploadInit({
      course: courseId,
      original_file_name: file.name,
      file_size: file.size,
      content_type: file.type || undefined,
    })

    const sizeError = validateWrittenHomeworkFileSize(file.size, initData.max_file_size)
    if (sizeError) {
      throw new Error(sizeError)
    }

    await uploadToS3(initData.upload_url, file, initData.headers['Content-Type'])

    const completed = await studentWrittenHomeworkFileUploadComplete({
      object_key: initData.object_key,
      original_file_name: file.name,
    })

    return completed
  }

  const handleFileChange = async (event: Event): Promise<void> => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    const homeworkId = pendingHomeworkId.value
    const replaceSubmission = pendingReplaceSubmission.value

    input.value = ''
    pendingHomeworkId.value = null
    pendingReplaceSubmission.value = false

    if (!file || homeworkId === null) {
      activeHomeworkId.value = null
      return
    }

    const courseId = Number(toValue(options.courseId))
    if (!Number.isFinite(courseId) || courseId <= 0) {
      error.value = 'Курс не найден'
      activeHomeworkId.value = null
      return
    }

    isSubmitting.value = true
    error.value = null

    try {
      const uploaded = await uploadSolutionFile(courseId, file)

      if (replaceSubmission) {
        await updateStudentHomeworkSubmission(homeworkId, { file_id: uploaded.id })
      } else {
        await createStudentHomeworkSubmission(homeworkId, { file_id: uploaded.id })
      }

      await options.onSuccess?.({
        homeworkId,
        isReplace: replaceSubmission,
        solutionFile: {
          file_id: uploaded.id,
          original_file_name: uploaded.original_file_name,
          file_url: uploaded.file_url,
        },
      })
    } catch (err: unknown) {
      error.value = resolveUploadFileErrorMessage(err, file.size, 'Не удалось отправить решение')
      console.error('[useStudentHomeworkSubmit] Ошибка:', err)
    } finally {
      isSubmitting.value = false
      activeHomeworkId.value = null
    }
  }

  const isHomeworkSubmitting = (homeworkId: number | null | undefined): boolean => {
    if (homeworkId === null || homeworkId === undefined) return false
    return isSubmitting.value && activeHomeworkId.value === homeworkId
  }

  const handleSubmitRequest = (
    homeworkId: number | null,
    replaceSubmission: boolean,
  ): void => {
    if (homeworkId === null) return
    openSubmitPicker(homeworkId, replaceSubmission)
  }

  return {
    fileInputRef,
    isSubmitting,
    error,
    handleFileChange,
    isHomeworkSubmitting,
    handleSubmitRequest,
  }
}
