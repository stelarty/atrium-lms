import { ref, toValue, type MaybeRefOrGetter } from 'vue'
import {
  lessonHomeworkFileUploadComplete,
  lessonHomeworkFileUploadInit,
} from '@/api/lesson-homework-files'
import { uploadToS3 } from '@/api/s3-upload'
import type { MaterialFileItem } from '@/types/file-upload'
import {
  DEFAULT_MAX_UPLOAD_FILE_SIZE_BYTES,
  getWrittenHomeworkFileExtension,
  resolveUploadFileErrorMessage,
  validateWrittenHomeworkFileExtension,
  validateWrittenHomeworkFileSize,
} from '@/utils/written-homework-file'

function generateClientId(): string {
  return `${Date.now()}-${crypto.randomUUID()}`
}

export function useLessonHomeworkFiles(courseId: MaybeRefOrGetter<number>) {
  const isUploading = ref(false)
  const error = ref<string | null>(null)

  function createPendingFile(file: File): MaterialFileItem {
    const extension = getWrittenHomeworkFileExtension(file.name)

    return {
      clientId: generateClientId(),
      originalName: file.name,
      extension: extension.toUpperCase() || 'FILE',
      progress: 0,
      status: 'pending',
    }
  }

  async function uploadFile(
    file: File,
    item: MaterialFileItem,
    updateItem: (clientId: string, patch: Partial<MaterialFileItem>) => void,
  ): Promise<void> {
    const cid = toValue(courseId)
    if (!Number.isFinite(cid) || cid <= 0) return

    const extensionError = validateWrittenHomeworkFileExtension(file.name)
    if (extensionError) {
      updateItem(item.clientId, {
        status: 'error',
        errorMessage: extensionError,
      })
      error.value = extensionError
      return
    }

    const clientSizeError = validateWrittenHomeworkFileSize(
      file.size,
      DEFAULT_MAX_UPLOAD_FILE_SIZE_BYTES,
    )
    if (clientSizeError) {
      updateItem(item.clientId, {
        status: 'error',
        errorMessage: clientSizeError,
      })
      error.value = clientSizeError
      return
    }

    try {
      updateItem(item.clientId, { status: 'uploading', progress: 0 })

      const initData = await lessonHomeworkFileUploadInit({
        course: cid,
        original_file_name: file.name,
        file_size: file.size,
        content_type: file.type || undefined,
      })

      const sizeError = validateWrittenHomeworkFileSize(file.size, initData.max_file_size)
      if (sizeError) {
        updateItem(item.clientId, {
          status: 'error',
          errorMessage: sizeError,
        })
        error.value = sizeError
        return
      }

      await uploadToS3(
        initData.upload_url,
        file,
        initData.headers['Content-Type'],
        (percent) => updateItem(item.clientId, { progress: percent }),
      )

      updateItem(item.clientId, { status: 'finalizing', progress: 100 })

      const completed = await lessonHomeworkFileUploadComplete({
        object_key: initData.object_key,
        original_file_name: file.name,
      })

      updateItem(item.clientId, {
        status: 'done',
        fileId: completed.id,
        fileUrl: completed.file_url,
        progress: 100,
      })
    } catch (requestError) {
      console.error('[useLessonHomeworkFiles] upload file error:', requestError)
      const message = resolveUploadFileErrorMessage(
        requestError,
        file.size,
        'Ошибка при загрузке файла',
      )
      updateItem(item.clientId, {
        status: 'error',
        errorMessage: message,
      })
      error.value = message
    }
  }

  async function uploadFiles(
    files: FileList | File[],
    appendFiles: (items: MaterialFileItem[]) => void,
    updateItem: (clientId: string, patch: Partial<MaterialFileItem>) => void,
  ): Promise<void> {
    isUploading.value = true
    error.value = null

    try {
      const pendingItems = Array.from(files).map(createPendingFile)
      appendFiles(pendingItems)

      await Promise.all(
        Array.from(files).map((file, index) => {
          const item = pendingItems[index]
          if (!item) return Promise.resolve()

          return uploadFile(file, item, updateItem)
        }),
      )
    } catch (requestError) {
      console.error('[useLessonHomeworkFiles] upload error:', requestError)
      error.value = 'Ошибка при загрузке файла домашнего задания'
    } finally {
      isUploading.value = false
    }
  }

  return {
    isUploading,
    error,
    uploadFiles,
  }
}
