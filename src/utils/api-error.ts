import { isUnauthorizedError } from '@/utils/unauthorized'

type ApiErrorResponseData = Record<string, unknown> & {
  detail?: string
}

export const AUTH_SESSION_EXPIRED_MESSAGE =
  'Сеанс входа истёк. Нажмите «Обновить страницу»'

const AUTH_ERROR_PATTERNS = [
  /invalid or expired access token/i,
  /expired access token/i,
  /access token.*expired/i,
]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const readDetail = (data: ApiErrorResponseData): string | null => {
  if (typeof data.detail === 'string' && data.detail.trim()) {
    return data.detail
  }
  return null
}

const readFirstFieldMessage = (data: ApiErrorResponseData, fieldKeys: string[]): string | null => {
  for (const key of fieldKeys) {
    const value = data[key]
    if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) {
      return value[0]
    }
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }
  return null
}

const GENERIC_AXIOS_STATUS_MESSAGE = /^Request failed with status code \d+$/i

export const isGenericAxiosStatusMessage = (message: string): boolean =>
  GENERIC_AXIOS_STATUS_MESSAGE.test(message.trim())

const collectErrorText = (error: unknown): string => {
  if (!isRecord(error)) {
    return typeof error === 'string' ? error : ''
  }

  const chunks: string[] = []

  if (typeof error.message === 'string') {
    chunks.push(error.message)
  }

  const response = error.response
  if (isRecord(response) && isRecord(response.data)) {
    const data = response.data as ApiErrorResponseData
    const detail = readDetail(data)
    if (detail) {
      chunks.push(detail)
    }
  }

  return chunks.join(' ')
}

export const isAuthSessionExpiredError = (error: unknown): boolean => {
  if (isUnauthorizedError(error)) {
    return true
  }

  const text = collectErrorText(error)
  if (!text.trim()) {
    return false
  }

  return AUTH_ERROR_PATTERNS.some((pattern) => pattern.test(text))
}

/**
 * Human-readable message from Axios-like API error.
 * @param fieldKeys — optional response body keys (first array/string value wins after detail)
 */
export function getApiErrorMessage(
  error: unknown,
  fallback: string,
  fieldKeys: string[] = [],
): string {
  if (isAuthSessionExpiredError(error)) {
    return AUTH_SESSION_EXPIRED_MESSAGE
  }

  if (!isRecord(error)) {
    return fallback
  }

  const response = error.response
  if (!isRecord(response) || !isRecord(response.data)) {
    const message = typeof error.message === 'string' ? error.message : ''
    return message.trim() || fallback
  }

  const data = response.data as ApiErrorResponseData
  const rawMessage = typeof error.message === 'string' ? error.message : ''
  const safeMessage =
    rawMessage.trim() && !isGenericAxiosStatusMessage(rawMessage) ? rawMessage : ''

  return readDetail(data) || readFirstFieldMessage(data, fieldKeys) || safeMessage || fallback
}
