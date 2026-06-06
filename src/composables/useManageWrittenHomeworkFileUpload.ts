import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  manageWrittenHomeworkFileUploadComplete,
  manageWrittenHomeworkFileUploadInit,
} from '@/api/manage-written-homework-files'
import { uploadToS3 } from '@/api/s3-upload'
import {
  DEFAULT_MAX_UPLOAD_FILE_SIZE_BYTES,
  validateWrittenHomeworkFileExtension,
  validateWrittenHomeworkFileSize,
} from '@/utils/written-homework-file'

export function useManageWrittenHomeworkFileUpload(
  courseId: MaybeRefOrGetter<number | string | null | undefined>,
) {
  async function uploadReviewFile(file: File): Promise<number> {
    const rawId = toValue(courseId)
    const cid = Number(rawId)
    if (rawId === null || rawId === undefined || rawId === '' || !Number.isFinite(cid) || cid <= 0) {
      throw new Error('Курс не выбран')
    }

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

    const initData = await manageWrittenHomeworkFileUploadInit({
      course: cid,
      original_file_name: file.name,
      file_size: file.size,
      content_type: file.type || undefined,
    })

    const sizeError = validateWrittenHomeworkFileSize(file.size, initData.max_file_size)
    if (sizeError) {
      throw new Error(sizeError)
    }

    await uploadToS3(initData.upload_url, file, initData.headers['Content-Type'])

    const completed = await manageWrittenHomeworkFileUploadComplete({
      object_key: initData.object_key,
      original_file_name: file.name,
    })

    return completed.id
  }

  return { uploadReviewFile }
}
