import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'
import {
  lessonMaterialUploadInit,
  lessonMaterialUploadComplete,
} from '@/api/lesson-materials'
import { uploadToS3 } from '@/api/s3-upload'
import { updateLesson } from '@/api/lessons'
import type { LmsLessonMaterialFile } from '@/types/lesson'
import type { MaterialFileItem, MaterialUploadStatus } from '@/types/file-upload'
import {
  DEFAULT_MAX_UPLOAD_FILE_SIZE_BYTES,
  resolveUploadFileErrorMessage,
  validateWrittenHomeworkFileSize,
} from '@/utils/written-homework-file'

const ALLOWED_EXTENSIONS = new Set([
  'mp3',
  'mp4',
  'pdf',
  'ppt',
  'pptx',
  'txt',
  'doc',
  'docx',
  'rtf',
  'odt',
  'djvu',
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
])

function getExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

function generateClientId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** LMSLessonMaterialFile.id — id файла для materials[] (см. доку бэкенда). */
function resolveLessonMaterialFileId(m: LmsLessonMaterialFile): number | undefined {
  const raw = m.id ?? m.file_id
  return typeof raw === 'number' && Number.isFinite(raw) && raw > 0 ? raw : undefined
}

/**
 * Материалы занятия (по доке бэкенда):
 * - create: upload-complete без lesson (pending) → привязка POST/PATCH lms-lessons с materials[] при сохранении;
 * - edit upload: upload-complete с lesson (в конец) — без лишнего PATCH;
 * - edit remove / save: PATCH lms-lessons с полным массивом materials[] (replace).
 */
export function useLessonMaterials(
  courseId: MaybeRefOrGetter<number>,
  lessonId: MaybeRefOrGetter<number | null | undefined>,
) {
  const materials = ref<MaterialFileItem[]>([])
  const baselineFileIds = ref<number[]>([])
  const uploadError = ref<string | null>(null)

  function areSameOrder(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false
    return a.every((id, index) => id === b[index])
  }

  function syncBaselineWithCurrent(): void {
    baselineFileIds.value = [...orderedPersistedFileIds()]
  }

  const hasMaterialChanges = computed(
    () => !areSameOrder(orderedPersistedFileIds(), baselineFileIds.value),
  )

  function updateItem(clientId: string, patch: Partial<MaterialFileItem>): void {
    const idx = materials.value.findIndex((m) => m.clientId === clientId)
    const item = materials.value[idx]
    if (item) Object.assign(item, patch)
  }

  function orderedPersistedFileIds(): number[] {
    return materials.value
      .filter((m) => m.status === 'done' && m.fileId !== undefined)
      .map((m) => m.fileId!)
  }

  async function persistLessonMaterialsReplace(nextIds: number[]): Promise<void> {
    const lid = toValue(lessonId)
    if (lid == null) return
    await updateLesson(lid, { materials: nextIds })
  }

  async function uploadFile(file: File): Promise<void> {
    const cid = toValue(courseId)
    if (!Number.isFinite(cid) || cid <= 0) {
      return
    }

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
      updateItem(clientId, { status: 'uploading', progress: 0 })

      const initData = await lessonMaterialUploadInit({
        course: cid,
        original_file_name: file.name,
        file_size: file.size,
        content_type: file.type || undefined,
      })

      const apiSizeError = validateWrittenHomeworkFileSize(file.size, initData.max_file_size)
      if (apiSizeError) {
        materials.value = materials.value.filter((item) => item.clientId !== clientId)
        uploadError.value = apiSizeError
        return
      }

      await uploadToS3(
        initData.upload_url,
        file,
        initData.headers['Content-Type'],
        (percent) => updateItem(clientId, { progress: percent }),
      )

      updateItem(clientId, { status: 'finalizing', progress: 100 })

      const lid = toValue(lessonId)
      const result = await lessonMaterialUploadComplete({
        object_key: initData.object_key,
        original_file_name: file.name,
        ...(lid != null && lid > 0 ? { lesson: lid } : {}),
      })

      updateItem(clientId, {
        status: 'done',
        fileId: result.id,
        fileUrl: result.file_url,
      })
    } catch (err: unknown) {
      console.error('[useLessonMaterials] upload error:', err)
      materials.value = materials.value.filter((item) => item.clientId !== clientId)
      uploadError.value = resolveUploadFileErrorMessage(err, file.size)
    }
  }

  async function uploadFiles(files: FileList | File[]): Promise<void> {
    uploadError.value = null
    const list = Array.from(files)
    const lid = toValue(lessonId)

    // В edit привязка через lesson в complete — последовательно, чтобы sort_order совпадал с UI.
    if (lid != null && lid > 0) {
      for (const file of list) {
        await uploadFile(file)
      }
      // В edit режиме upload-complete уже привязывает к уроку.
      syncBaselineWithCurrent()
      return
    }

    await Promise.allSettled(list.map((f) => uploadFile(f)))
  }

  async function removeFile(clientId: string): Promise<void> {
    const item = materials.value.find((m) => m.clientId === clientId)
    if (!item) return

    if (item.status !== 'done' || item.fileId == null) {
      materials.value = materials.value.filter((m) => m.clientId !== clientId)
      return
    }

    const lid = toValue(lessonId)
    if (lid == null || lid <= 0) {
      materials.value = materials.value.filter((m) => m.clientId !== clientId)
      return
    }

    try {
      const nextIds = orderedPersistedFileIds().filter((id) => id !== item.fileId)
      await persistLessonMaterialsReplace(nextIds)
      materials.value = materials.value.filter((m) => m.clientId !== clientId)
      syncBaselineWithCurrent()
    } catch (err) {
      console.error('[useLessonMaterials] remove error:', err)
    }
  }

  function getFileIds(): number[] {
    return orderedPersistedFileIds()
  }

  function setExistingMaterials(serverMaterials: LmsLessonMaterialFile[]): void {
    materials.value = [...serverMaterials]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .flatMap((m) => {
        const fileId = resolveLessonMaterialFileId(m)
        if (fileId == null) {
          console.warn('[useLessonMaterials] Material without file id skipped:', m)
          return []
        }
        return [
          {
            clientId: generateClientId(),
            fileId,
            originalName: m.original_file_name,
            fileUrl: m.file_url,
            extension: getExtension(m.original_file_name).toUpperCase() || 'FILE',
            progress: 100,
            status: 'done' as MaterialUploadStatus,
          },
        ]
      })
    syncBaselineWithCurrent()
  }

  function clearMaterials(): void {
    materials.value = []
    syncBaselineWithCurrent()
  }

  return {
    materials,
    uploadError,
    hasMaterialChanges,
    uploadFile,
    uploadFiles,
    removeFile,
    getFileIds,
    setExistingMaterials,
    clearMaterials,
  }
}
