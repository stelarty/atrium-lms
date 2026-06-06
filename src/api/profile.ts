// src/api/profile.ts
import { api } from './index'
import type {
  ChangeEmailPayload,
  ChangePasswordPayload,
  ConfirmEmailChangeResult,
  EditProfilePayload,
  ProfileData,
} from './types/profile'

/**
 * Получить данные профиля пользователя
 * @returns объект профиля
 */
export async function fetchProfile(): Promise<ProfileData> {
  try {
    const response = await api.get<ProfileData>('/edspace/profile/')
    return response.data
  } catch (error) {
    console.error('[Profile API] Ошибка получения профиля:', error)
    throw error
  }
}

/**
 * Полное обновление профиля (PUT)
 * @param payload объект профиля для обновления
 */
export async function updateProfile(payload: EditProfilePayload): Promise<void> {
  try {
    await api.put('/edspace/profile/', payload, {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[Profile API] Ошибка обновления профиля (PUT):', error)
    throw error
  }
}

/**
 * Частичное обновление профиля (PATCH)
 * Можно передавать только изменённые поля
 * @param payload частичный объект для обновления
 */
export async function updateProfilePatch(payload: Partial<EditProfilePayload>): Promise<void> {
  try {
    await api.patch('/edspace/profile/', payload, {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[Profile API] Ошибка обновления профиля (PATCH):', error)
    throw error
  }
}

export async function requestEmailChange(payload: ChangeEmailPayload): Promise<void> {
  try {
    await api.post('/user/change_email/', payload, {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[Profile API] Ошибка запроса смены email:', error)
    throw error
  }
}

export async function confirmEmailChange(
  uid: string,
  token: string,
  email: string,
): Promise<ConfirmEmailChangeResult> {
  try {
    await api.post(`/user/email_change_confirm/${uid}/${token}/`, null, {
      params: { email },
    })
    return { success: true }
  } catch (error) {
    console.error('[Profile API] Ошибка подтверждения смены email:', error)
    const apiError = error as { response?: { data?: { detail?: string } } }
    return {
      success: false,
      message: apiError.response?.data?.detail || 'Ошибка при подтверждении email',
    }
  }
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  try {
    await api.patch('/user/change_password/', payload, {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[Profile API] Ошибка смены пароля:', error)
    throw error
  }
}
