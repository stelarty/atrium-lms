/**
 * Ответ от API когда онбординг не пройден
 * @property {false} onboarding_done - флаг, что онбординг не завершен
 * @property {boolean} step_platform_visited - пользователь посетил платформу
 * @property {boolean} step_joined_telegram - пользователь присоединился к Telegram группе
 * @property {boolean} step_completed_first_homework - пользователь выполнил первое задание
 */
export interface OnboardingIncompleteResponse {
  onboarding_done: false
  step_platform_visited: boolean
  step_joined_telegram: boolean
  step_completed_first_homework: boolean
}

/**
 * Ответ от API когда онбординг пройден
 * @property {true} onboarding_done - флаг, что онбординг завершен
 * @property {boolean} is_seen - флаг, что результат был просмотрен пользователем
 */
export interface OnboardingCompleteResponse {
  onboarding_done: true
  is_seen: boolean
}

/**
 * Объединённый тип для ответа API
 * Использует discriminated union на основе `onboarding_done`
 */
export type OnboardingResponse = OnboardingIncompleteResponse | OnboardingCompleteResponse

/**
 * Payload для PATCH запроса при отметке онбординга как просмотренного
 */
export interface UpdateOnboardingPayload {
  is_seen: boolean
}
