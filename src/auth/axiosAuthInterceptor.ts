import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { getAccessToken } from '@/auth/accessTokenMemory'
import { refreshAccessToken } from '@/auth/authSession'
import { isAuthV2Enabled, buildPotokLoginUrl } from '@/auth/authConfig'
import { isAuthSessionExpiredError } from '@/utils/api-error'
import {
  isAuthRequest,
  isSessionRevoked,
  resetSessionRevoked,
  revokeSession,
  SESSION_EXPIRED_CANCEL_MESSAGE,
} from '@/utils/unauthorized'

let isRefreshing = false
let refreshSubscribers: Array<(token: string | null) => void> = []

const subscribeTokenRefresh = (callback: (token: string | null) => void): void => {
  refreshSubscribers.push(callback)
}

const notifyRefreshSubscribers = (token: string | null): void => {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

const rejectSessionExpired = (): Promise<never> => {
  return Promise.reject(new axios.CanceledError(SESSION_EXPIRED_CANCEL_MESSAGE))
}

const redirectToLogin = (onSessionInvalid: () => void): void => {
  if (typeof window === 'undefined') {
    return
  }

  revokeSession()
  onSessionInvalid()
  const redirect = encodeURIComponent(window.location.href)
  window.location.replace(buildPotokLoginUrl(redirect))
}

/**
 * On 401 / "Invalid or expired access token":
 * 1) refresh access via HttpOnly cookie (POST auth/refresh/)
 * 2) retry the failed request with the new Bearer token
 * 3) if refresh fails — redirect to Potok login (reload alone does not help without cookie)
 */
export const attachAuthResponseInterceptor = (
  client: AxiosInstance,
  onSessionInvalid: () => void,
): void => {
  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      const axiosError = error as AxiosError
      const config = axiosError.config as InternalAxiosRequestConfig & { _retry?: boolean }

      if (!isAuthV2Enabled()) {
        return Promise.reject(error)
      }

      if (!isAuthSessionExpiredError(error) || isAuthRequest(config?.url)) {
        return Promise.reject(error)
      }

      if (isSessionRevoked()) {
        return rejectSessionExpired()
      }

      if (!config || config._retry) {
        redirectToLogin(onSessionInvalid)
        return rejectSessionExpired()
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (!token) {
              reject(new axios.CanceledError(SESSION_EXPIRED_CANCEL_MESSAGE))
              return
            }

            config.headers.Authorization = `Bearer ${token}`
            config._retry = true
            resolve(client(config))
          })
        })
      }

      config._retry = true
      isRefreshing = true
      resetSessionRevoked()

      const refreshed = await refreshAccessToken()
      isRefreshing = false

      const token = refreshed ? getAccessToken() : null
      notifyRefreshSubscribers(token)

      if (!token) {
        redirectToLogin(onSessionInvalid)
        return rejectSessionExpired()
      }

      config.headers.Authorization = `Bearer ${token}`
      return client(config)
    },
  )
}
