/** Default upload limit from backend (5 MB). */
export const DEFAULT_MAX_UPLOAD_FILE_SIZE_BYTES = 5 * 1024 * 1024

const WRITTEN_HOMEWORK_ALLOWED_EXTENSIONS = new Set([
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

export function getWrittenHomeworkFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

export function validateWrittenHomeworkFileExtension(fileName: string): string | null {
  const extension = getWrittenHomeworkFileExtension(fileName)
  if (!WRITTEN_HOMEWORK_ALLOWED_EXTENSIONS.has(extension)) {
    return `Неподдерживаемый формат: .${extension || 'файл'}`
  }
  return null
}

export function validateWrittenHomeworkFileSize(
  fileSize: number,
  maxFileSize: number,
): string | null {
  if (fileSize > maxFileSize) {
    const maxMb = Math.round(maxFileSize / (1024 * 1024))
    return `Файл слишком большой. Максимум: ${maxMb} МБ`
  }
  return null
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

function isLikelyFileSizeApiRejection(error: unknown): boolean {
  if (!isRecord(error)) return false

  const response = error.response
  if (!isRecord(response)) return false

  const status = response.status
  if (status === 413) return true

  if (status === 400 && isRecord(response.data)) {
    const data = response.data
    if ('file_size' in data) return true
    if (typeof data.detail === 'string' && /file|size|размер|мб|mb/i.test(data.detail)) {
      return true
    }
  }

  return false
}

/** Human-readable upload error; maps generic 400/413 to 5 MB limit when applicable. */
export function resolveUploadFileErrorMessage(
  error: unknown,
  fileSize: number,
  fallback = 'Ошибка при загрузке файла',
): string {
  if (error instanceof Error && error.message.trim()) {
    const message = error.message.trim()
    if (!/^Request failed with status code \d+$/i.test(message)) {
      return message
    }
  }

  const sizeError = validateWrittenHomeworkFileSize(
    fileSize,
    DEFAULT_MAX_UPLOAD_FILE_SIZE_BYTES,
  )

  if (sizeError && (fileSize > DEFAULT_MAX_UPLOAD_FILE_SIZE_BYTES || isLikelyFileSizeApiRejection(error))) {
    return sizeError
  }

  if (!isRecord(error)) {
    return fallback
  }

  const response = error.response
  if (!isRecord(response) || !isRecord(response.data)) {
    return fallback
  }

  const data = response.data as Record<string, unknown>
  const detail = typeof data.detail === 'string' ? data.detail.trim() : ''
  if (detail) return detail

  const fileSizeField = data.file_size
  if (Array.isArray(fileSizeField) && typeof fileSizeField[0] === 'string' && fileSizeField[0].trim()) {
    return fileSizeField[0]
  }

  return fallback
}
