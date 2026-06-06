export const apiBaseUrl = import.meta.env.VITE_PUBLIC_API_BASE_URL || 'https://test-potok.atriumolymp.com'
export const apiLmsUrl = import.meta.env.VITE_LMS_BASE_URL || 'https://test-edspace.atriumolymp.com'

/** Origin Потока без trailing slash (для postMessage). */
export const getPotokOrigin = (): string => new URL(apiBaseUrl).origin

/** Страница входа Потока (test/prod — из `VITE_PUBLIC_API_BASE_URL`). */
export const getPotokLoginUrl = (): string => {
  const base = String(apiBaseUrl).replace(/\/+$/, '')
  return `${base}/auth/login`
}

/** Витрина / корзина Olymp (test vs prod — VITE_OLYMP_BASE_URL, как в Potok `apiOlympUrl`). */
const rawOlympBaseUrl = import.meta.env.VITE_OLYMP_BASE_URL || 'https://test.atriumolymp.com'

export const getOlympBasketUrl = (): string => {
  const base = String(rawOlympBaseUrl).replace(/\/+$/, '')
  return `${base}/basket/`
}

/** Ссылка на страницу выхода Потока с возвратом на LMS после подтверждения выхода. */
export const buildPotokLogoutUrl = (): string => {
  if (typeof window === 'undefined') {
    return `${apiBaseUrl}/auth/logout?source=lms`
  }

  const returnTo = encodeURIComponent(`${window.location.origin}/logout-handler`)
  return `${apiBaseUrl}/auth/logout?source=lms&return_to=${returnTo}`
}
