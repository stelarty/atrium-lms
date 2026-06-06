const stripTrailingSlash = (url: string): string => url.replace(/\/+$/, '')

export const apiBaseUrl = stripTrailingSlash(
  import.meta.env.VITE_PUBLIC_API_BASE_URL || 'https://test-potok.atriumolymp.com',
)

export const apiBasePath = `${apiBaseUrl}/api/`

export const isAuthV2Enabled = (): boolean => import.meta.env.VITE_AUTH_V2 !== 'false'

export const getAppOrigin = (): string => {
  if (typeof window !== 'undefined') return window.location.origin
  return stripTrailingSlash(import.meta.env.VITE_LMS_BASE_URL || 'https://test-edspace.atriumolymp.com')
}

export const getAppCallbackUrl = (): string => `${getAppOrigin()}/auth/callback`

export const buildPotokLoginUrl = (redirect?: string): string => {
  const base = `${apiBaseUrl}/auth/login`
  if (!redirect) return base
  return `${base}?redirect=${encodeURIComponent(redirect)}`
}
