import { ref } from 'vue'
import { uploadInit, uploadComplete, deleteMaterial } from '@/api/course-materials'
import { uploadToS3 } from '@/api/s3-upload'
import type { CourseMaterialFromCourse } from '@/api/course-materials'
import type { MaterialFileItem, MaterialUploadStatus } from '@/types/file-upload'
import {
  DEFAULT_MAX_UPLOAD_FILE_SIZE_BYTES,
  resolveUploadFileErrorMessage,
  validateWrittenHomeworkFileSize,
} from '@/utils/written-homework-file'

const ALLOWED_EXTENSIONS = new Set([
  'mp3', 'mp4', 'pdf', 'ppt', 'pptx', 'txt',
  'doc', 'docx', 'rtf', 'odt', 'djvu',
  'jpg', 'jpeg', 'png', 'webp', 'gif',
])

function getExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

function generateClientId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useCourseMaterials() {
  const materials = ref<MaterialFileItem[]>([])
  const uploadError = ref<string | null>(null)

  function updateItem(clientId: string, patch: Partial<MaterialFileItem>): void {
    const idx = materials.value.findIndex((m) => m.clientId === clientId)
    const item = materials.value[idx]
    if (item) Object.assign(item, patch)
  }

  async function uploadFile(file: File): Promise<void> {
    const extension = getExtension(file.name)

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      uploadError.value = `Неподдерживаемый формат: .${extension}`
      return
    }

    const clientSizeError = validateWrittenHomeworkFileSize(
      file.size,
      DEFAULT_MAX_UPLOAD_FILE_SIZE_BYTES,
    )
    if (clientSizeError) {
      uploadError.value = clientSizeError
      return
    }

    const clientId = generateClientId()

    materials.value.push({
      clientId,
      originalName: file.name,
      extension: extension.toUpperCase() || 'FILE',
      progress: 0,
      status: 'pending',
    })

    try {
      // Шаг 1: upload-init (без course)
      updateItem(clientId, { status: 'uploading', progress: 0 })

      const initData = await uploadInit({
        original_file_name: file.name,
        file_size: file.size,
        content_type: file.type || 'application/octet-stream',
      })

      const apiSizeError = validateWrittenHomeworkFileSize(file.size, initData.max_file_size)
      if (apiSizeError) {
        materials.value = materials.value.filter((item) => item.clientId !== clientId)
        uploadError.value = apiSizeError
        return
      }

      // Шаг 2: PUT в S3
      await uploadToS3(
        initData.upload_url,
        file,
        initData.headers['Content-Type'],
        (percent) => updateItem(clientId, { progress: percent }),
      )

      // Шаг 3: upload-complete (без course)
      updateItem(clientId, { status: 'finalizing', progress: 100 })

      const result = await uploadComplete({
        object_key: initData.object_key,
        original_file_name: file.name,
      })

      // Сохраняем file_id — он нужен при передаче в materials[] курса
      updateItem(clientId, {
        status: 'done',
        fileId: result.file_id,
        // file_in_course_id будет null до привязки к курсу
        fileInCourseId: result.file_in_course_id ?? undefined,
        fileUrl: result.file_url,
      })
    } catch (err: unknown) {
      console.error('[useCourseMaterials] upload error:', err)
      materials.value = materials.value.filter((item) => item.clientId !== clientId)
      uploadError.value = resolveUploadFileErrorMessage(err, file.size)
    }
  }

  async function uploadFiles(files: FileList | File[]): Promise<void> {
    uploadError.value = null
    await Promise.allSettled(Array.from(files).map(uploadFile))
  }

  async function removeFile(clientId: string): Promise<void> {
    const item = materials.value.find((m) => m.clientId === clientId)
    if (!item) return

    // Файл не привязан к курсу (fileInCourseId нет) — просто убираем локально
    if (!item.fileInCourseId) {
      materials.value = materials.value.filter((m) => m.clientId !== clientId)
      return
    }

    try {
      // Удаление по file_in_course_id
      await deleteMaterial(item.fileInCourseId)
      materials.value = materials.value.filter((m) => m.clientId !== clientId)
    } catch (err) {
      console.error('[useCourseMaterials] delete error:', err)
    }
  }

  /**
   * Возвращает массив file_id всех успешно загруженных файлов.
   * Используется при передаче в materials[] при создании/обновлении курса.
   */
  function getFileIds(): number[] {
    return materials.value
      .filter((m) => m.status === 'done' && m.fileId !== undefined)
      .map((m) => m.fileId!)
  }

  /**
   * Инициализация из уже сохранённых материалов курса (GET /lms-courses/<id>/)
   */
  function setExistingMaterials(serverMaterials: CourseMaterialFromCourse[]): void {
    materials.value = serverMaterials.map((m) => ({
      clientId: generateClientId(),
      fileId: m.file_id,
      fileInCourseId: m.file_in_course_id ?? undefined,
      originalName: m.original_file_name,
      fileUrl: m.file_url,
      extension: getExtension(m.original_file_name).toUpperCase() || 'FILE',
      progress: 100,
      status: 'done' as MaterialUploadStatus,
    }))
  }

  function clearMaterials(): void {
    materials.value = []
  }

  return {
    materials,
    uploadError,
    uploadFile,
    uploadFiles,
    removeFile,
    getFileIds,
    setExistingMaterials,
    clearMaterials,
  }
}
