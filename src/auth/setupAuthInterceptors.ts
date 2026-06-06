import axios, { type InternalAxiosRequestConfig } from 'axios'
import { getAccessToken } from '@/auth/accessTokenMemory'
import { attachAuthResponseInterceptor } from '@/auth/axiosAuthInterceptor'
import { isAuthV2Enabled } from '@/auth/authConfig'
import { isSessionRevoked } from '@/utils/unauthorized'

const attachBearer = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = getAccessToken()
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

export function setupAuthInterceptors(onSessionInvalid: () => void): void {
  if (!isAuthV2Enabled()) return

  axios.defaults.withCredentials = true

  axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (isSessionRevoked()) {
      return Promise.reject(new axios.CanceledError('Session revoked'))
    }
    return attachBearer(config)
  })

  attachAuthResponseInterceptor(axios, onSessionInvalid)
}
