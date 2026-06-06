// src/stores/useAuthStore.ts
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { getAccessToken, hasAccessToken, setAccessToken } from '@/auth/accessTokenMemory'
import { clearAccessMemory, clearLegacyLocalStorageAuth } from '@/auth/clearAuth'
import { postExchangeCode } from '@/auth/authApi'
import { bootstrapAuthSession } from '@/auth/authSession'
import { apiBaseUrl, getAppCallbackUrl } from '@/auth/authConfig'
import { pauseAuthTabSync } from '@/auth/authTabSync'
import { resetSessionRevoked } from '@/utils/unauthorized'
import { useUserStore } from './useUserStore'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = computed(() => hasAccessToken())

  const accessToken = computed(() => getAccessToken() ?? '')

  const applySession = (token: string): void => {
    resetSessionRevoked()
    clearLegacyLocalStorageAuth()
    setAccessToken(token)
    pauseAuthTabSync()
  }

  const clearSession = (): void => {
    clearAccessMemory()
    clearLegacyLocalStorageAuth()

    const userStore = useUserStore()
    userStore.profile = null
    userStore.isInitialized = false
    userStore.clearNavigationCache()
  }

  const initializeAuth = (): void => {
    clearLegacyLocalStorageAuth()
  }

  const bootstrap = async (): Promise<boolean> => {
    const result = await bootstrapAuthSession()
    if (result === 'guest') {
      clearSession()
      return false
    }
    return true
  }

  const exchangeAuthCode = async (code: string): Promise<boolean> => {
    try {
      const data = await postExchangeCode(code, getAppCallbackUrl())
      applySession(data.access_token)
      return true
    } catch (error) {
      console.error('[Auth] Code exchange failed', error)
      return false
    }
  }

  const startLogoutOnPotok = (): void => {
    const returnTo = encodeURIComponent(`${window.location.origin}/logout-handler`)
    window.location.href = `${apiBaseUrl}/auth/logout?source=lms&return_to=${returnTo}`
  }

  return {
    isAuthenticated,
    accessToken,
    initializeAuth,
    bootstrap,
    exchangeAuthCode,
    applySession,
    clearSession,
    startLogoutOnPotok,
  }
})
