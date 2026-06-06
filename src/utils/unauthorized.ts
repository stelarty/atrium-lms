import axios, { type AxiosError } from 'axios'
import { getAccessToken } from '@/auth/accessTokenMemory'

export const SESSION_EXPIRED_CANCEL_MESSAGE = 'Session expired'

let sessionRevoked = false
let revokedToken: string | null = null

export const isUnauthorizedError = (error: unknown): boolean => {
  const axiosError = error as AxiosError
  return axiosError.response?.status === 401
}

export const isSessionRevoked = (): boolean => sessionRevoked

export const revokeSession = (): void => {
  sessionRevoked = true
  revokedToken = getAccessToken()
}

export const resetSessionRevoked = (): void => {
  sessionRevoked = false
  revokedToken = null
}

/** Ignore repeated LOGIN postMessage with the same token that already caused 401. */
export const shouldIgnoreSyncedToken = (token: string): boolean => {
  return sessionRevoked && revokedToken !== null && token === revokedToken
}

export const isRequestCancelled = (error: unknown): boolean => {
  const message = (error as { message?: string })?.message
  return (
    axios.isCancel(error) ||
    message === 'Session revoked' ||
    message === SESSION_EXPIRED_CANCEL_MESSAGE
  )
}

export const isAuthSyncRoute = (): boolean =>
  window.location.pathname.includes('/auth/callback') ||
  window.location.pathname.includes('/logout-handler')

export const isAuthRequest = (url?: string): boolean => {
  if (!url) return false
  const normalized = url.toLowerCase()
  return (
    normalized.includes('/auth/login') ||
    normalized.includes('/auth/refresh') ||
    normalized.includes('/auth/exchange') ||
    normalized.includes('/auth/session')
  )
}
