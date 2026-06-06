/**
 * Прямая загрузка файла по presigned URL (шаг после upload-init на бэкенде).
 * Не использует общий Axios-инстанс: URL внешний, без Authorization LMS.
 */
export function uploadToS3(
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', contentType)

    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100))
        }
      })
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(Object.assign(new Error('S3 upload failed'), { status: xhr.status }))
    }
    xhr.onerror = () => reject(new Error('Network error during S3 upload'))
    xhr.ontimeout = () => reject(new Error('S3 upload timed out'))
    xhr.send(file)
  })
}
