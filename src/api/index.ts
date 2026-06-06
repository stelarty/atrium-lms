// src/api/index.ts
import axios from 'axios'
import { attachAuthResponseInterceptor } from '@/auth/axiosAuthInterceptor'
import { isAuthV2Enabled } from '@/auth/authConfig'
import { getAccessToken } from '@/auth/accessTokenMemory'
import { useAuthStore } from '@/stores/useAuthStore'
import { isSessionRevoked } from '@/utils/unauthorized'

const BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL || 'https://test-potok.atriumolymp.com'

export const api = axios.create({
  baseURL: `${BASE_URL}/api/`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use(
  (config) => {
    if (isSessionRevoked()) {
      return Promise.reject(new axios.CanceledError('Session revoked'))
    }

    const token = getAccessToken()
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

if (isAuthV2Enabled()) {
  attachAuthResponseInterceptor(api, () => useAuthStore().clearSession())
}

export function addToken(token: string): void {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export function removeToken(): void {
  delete api.defaults.headers.common['Authorization']
}

export * from './courses'
export * from './profile'
export * from './onboarding'
export * from './student-homework'
export * from './student-lessons'
export * from '../types/course'
export * from './types/profile'
export * from './types/onboarding'
