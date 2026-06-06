// src/stores/useUserStore.ts
import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  changePassword,
  confirmEmailChange,
  fetchProfile,
  requestEmailChange,
  updateProfilePatch,
} from '@/api/profile'
import { useAuthStore } from '@/stores/useAuthStore'
import { getApiErrorMessage } from '@/utils/api-error'
import { isRequestCancelled, isSessionRevoked } from '@/utils/unauthorized'
import type {
  ChangePasswordPayload,
  ConfirmEmailChangeResult,
  EditProfilePayload,
  ProfileData,
} from '@/api/types/profile'
// src/stores/useUserStore.ts
export const useUserStore = defineStore('user', () => {
  const profile = ref<ProfileData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  // ✅ Новое: кэшированный маршрут по умолчанию
  const preferredHomeRoute = ref<string | null>(localStorage.getItem('preferredHomeRoute'))
  const role = ref<string | null>(localStorage.getItem('role'))

  const canAccessPlatform = computed(() => {
    return !!profile.value?.courses?.length
  })

  const applyProfileData = (data: ProfileData): void => {
    profile.value = data
    isInitialized.value = true

    const route = data.is_staff ? '/teacher' : '/student'
    role.value = data.is_staff ? 'teacher' : 'student'
    preferredHomeRoute.value = route
    localStorage.setItem('preferredHomeRoute', route)
    localStorage.setItem('role', role.value)
  }

  const mergeProfile = (partial: Partial<ProfileData>): void => {
    if (profile.value) {
      profile.value = { ...profile.value, ...partial }
    }
  }

  const fetchProfileData = async (): Promise<void> => {
    if (isSessionRevoked()) return

    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    // Если уже загружен — просто выходим
    if (isInitialized.value) return

    // Если уже загружается — ждём окончания
    if (isLoading.value) {
      return new Promise((resolve) => {
        const unwatch = watch(isLoading, (newVal) => {
          if (!newVal) {
            resolve(undefined)
            unwatch()
          }
        })
      })
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await fetchProfile()
      applyProfileData(data)
    } catch (err: unknown) {
      if (isRequestCancelled(err) || isSessionRevoked()) return
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      error.value = axiosErr?.response?.data?.detail || 'Ошибка загрузки профиля'
      console.error('[useUserStore] Ошибка:', error.value)
      isInitialized.value = true
    } finally {
      isLoading.value = false
    }
  }

  // src/stores/useUserStore.ts

  const updateProfileData = async (payload: Partial<EditProfilePayload>): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Используем PATCH — только изменения
      await updateProfilePatch(payload)

      // Обновляем профиль локально
      if (profile.value) {
        profile.value = {
          ...profile.value,
          ...payload,
        }
      }
    } catch (err: unknown) {
      error.value = getApiErrorMessage(err, 'Ошибка обновления профиля')
      console.error('[useUserStore] Ошибка:', error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const requestProfileEmailChange = async (newEmail: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      await requestEmailChange({ new_email: newEmail, url_from: 'lms' })
    } catch (err: unknown) {
      const apiError = err as {
        response?: { data?: { detail?: string; new_email?: string[] } }
      }
      error.value =
        apiError.response?.data?.detail ||
        apiError.response?.data?.new_email?.[0] ||
        'Ошибка при смене email'
      console.error('[useUserStore] Ошибка смены email:', error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const confirmProfileEmailChange = async (
    uid: string,
    token: string,
    email: string,
  ): Promise<ConfirmEmailChangeResult> => {
    isLoading.value = true
    error.value = null

    try {
      const result = await confirmEmailChange(uid, token, email)
      if (result.success) {
        try {
          const data = await fetchProfile()
          applyProfileData(data)
        } catch {
          isInitialized.value = false
        }
      } else {
        error.value = result.message || 'Ошибка при подтверждении email'
      }
      return result
    } finally {
      isLoading.value = false
    }
  }

  const changeProfilePassword = async (payload: ChangePasswordPayload): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      await changePassword(payload)
    } catch (err: unknown) {
      const apiError = err as {
        response?: { data?: { detail?: string; old_password?: string[]; new_password?: string[] } }
      }
      error.value =
        apiError.response?.data?.detail ||
        apiError.response?.data?.old_password?.[0] ||
        apiError.response?.data?.new_password?.[0] ||
        'Ошибка при смене пароля'
      console.error('[useUserStore] Ошибка смены пароля:', error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchUserData = async (): Promise<void> => {
    await fetchProfileData()
  }

  /** Сброс роли и домашнего маршрута (при выходе из аккаунта). */
  const clearNavigationCache = (): void => {
    role.value = null
    preferredHomeRoute.value = null
    localStorage.removeItem('role')
    localStorage.removeItem('preferredHomeRoute')
  }

  return {
    profile,
    isLoading,
    error,
    isInitialized,
    canAccessPlatform,
    preferredHomeRoute,
    clearNavigationCache,
    mergeProfile,
    fetchUserData,
    fetchProfileData,
    updateProfileData,
    requestProfileEmailChange,
    confirmProfileEmailChange,
    changeProfilePassword,
  }
})
