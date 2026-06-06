import type { MaterialFileItem } from '@/types/file-upload'

export const getFileExtension = (fileName: string): string => {
  const extension = fileName.split('.').pop()
  return extension ? extension.toUpperCase().slice(0, 4) : 'FILE'
}

export const mapUrlFileToMaterialItem = (
  id: string | number,
  originalName: string,
  fileUrl: string,
  options?: Pick<MaterialFileItem, 'fileId' | 'removable'>,
): MaterialFileItem => ({
  clientId: String(id),
  fileId: options?.fileId ?? (typeof id === 'number' ? id : undefined),
  originalName,
  fileUrl,
  extension: getFileExtension(originalName),
  progress: 100,
  status: 'done',
  removable: options?.removable,
})
