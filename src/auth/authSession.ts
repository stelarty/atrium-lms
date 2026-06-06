import { setAccessToken } from '@/auth/accessTokenMemory'
import { clearLegacyLocalStorageAuth } from '@/auth/clearAuth'
import { getSession, postRefresh } from '@/auth/authApi'

export type BootstrapResult = 'authenticated' | 'guest'

let refreshPromise: Promise<boolean> | null = null

export const refreshAccessToken = async (): Promise<boolean> => {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const data = await postRefresh()
          setAccessToken(data.access_token)
          return true
        } catch {
          if (attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 400))
            continue
          }
          setAccessToken(null)
          return false
        }
      }
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export const bootstrapAuthSession = async (): Promise<BootstrapResult> => {
  clearLegacyLocalStorageAuth()

  if (await refreshAccessToken()) {
    return 'authenticated'
  }

  try {
    const session = await getSession()
    if (!session.authenticated) return 'guest'
    return (await refreshAccessToken()) ? 'authenticated' : 'guest'
  } catch {
    return 'guest'
  }
}
