import { refreshAccessToken } from '@/auth/authSession'
import { resetSessionRevoked } from '@/utils/unauthorized'

/** Сбрасывает флаг revoked и запрашивает новый access по refresh-cookie. */
export async function retryAfterAuthRecovery(): Promise<boolean> {
  resetSessionRevoked()
  return refreshAccessToken()
}

export function reloadApplicationPage(): void {
  window.location.reload()
}
