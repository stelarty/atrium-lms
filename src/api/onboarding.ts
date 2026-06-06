// src/api/onboarding.ts
import { api } from './index'
import type { OnboardingResponse, UpdateOnboardingPayload } from './types/onboarding'

/**
 * Получить статус онбординга пользователя
 * @returns статус онбординга
 */
export async function fetchOnboarding(): Promise<OnboardingResponse> {
  try {
    const response = await api.get<OnboardingResponse>('/edspace/onboarding/')
    return response.data
  } catch (error) {
    console.error('[Onboarding API] Ошибка получения статуса онбординга:', error)
    throw error
  }
}

/**
 * Обновить статус онбординга (PATCH)
 * @param payload объект с полем is_seen
 */
export async function updateOnboarding(payload: UpdateOnboardingPayload): Promise<void> {
  try {
    await api.patch('/edspace/onboarding/', payload, {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[Onboarding API] Ошибка обновления онбординга:', error)
    throw error
  }
}

/**
 * Отметить шаг «зашёл в полезные материалы / Telegram» (идемпотентно).
 * Тот же формат ответа, что GET /edspace/onboarding/, пока онбординг не завершён.
 */
export async function postOnboardingJoinedTelegram(): Promise<OnboardingResponse> {
  try {
    const response = await api.post<OnboardingResponse>('/edspace/onboarding/joined-telegram/')
    return response.data
  } catch (error) {
    console.error('[Onboarding API] Ошибка joined-telegram:', error)
    throw error
  }
}
