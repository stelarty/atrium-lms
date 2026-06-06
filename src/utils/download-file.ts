export function fileNameFromUrl(url: string, fallback = 'file'): string {
  try {
    const pathname = new URL(url, window.location.origin).pathname
    const segment = pathname.split('/').filter(Boolean).pop()
    if (segment) return decodeURIComponent(segment)
  } catch {
    const segment = url.split('/').filter(Boolean).pop()
    if (segment) return decodeURIComponent(segment.split('?')[0] ?? segment)
  }

  return fallback
}

function triggerBrowserDownload(url: string, fileName: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.rel = 'noopener noreferrer'
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/** Downloads a remote file (same behaviour as MaterialFileList file icon). */
export async function downloadRemoteFile(
  fileUrl: string,
  fileName: string,
): Promise<void> {
  try {
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`)
    }

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    triggerBrowserDownload(objectUrl, fileName)
    URL.revokeObjectURL(objectUrl)
  } catch (error) {
    console.error('[downloadRemoteFile] Ошибка скачивания:', error)
    triggerBrowserDownload(fileUrl, fileName)
  }
}
