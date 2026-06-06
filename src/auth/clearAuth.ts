import { setAccessToken } from '@/auth/accessTokenMemory'

const LEGACY_KEYS = ['accessToken', 'isAuthenticated'] as const

export const clearLegacyLocalStorageAuth = (): void => {
  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key)
  }
}

export const clearAccessMemory = (): void => {
  setAccessToken(null)
}
