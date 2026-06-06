import { computed, type Ref } from 'vue'
import { isAuthSessionExpiredError } from '@/utils/api-error'
import { reloadApplicationPage, retryAfterAuthRecovery } from '@/utils/auth-session-recovery'
import { isRequestCancelled } from '@/utils/unauthorized'

export function useLoadErrorRetry(lastError: Ref<unknown>, retryLoad: () => Promise<void>) {
  const isSessionExpiredError = computed(() => isAuthSessionExpiredError(lastError.value))

  const retryButtonLabel = computed(() =>
    isSessionExpiredError.value ? 'Обновить страницу' : 'Повторить',
  )

  const handleRetry = async (): Promise<void> => {
    if (isSessionExpiredError.value) {
      const recovered = await retryAfterAuthRecovery()
      if (recovered) {
        try {
          await retryLoad()
        } catch (error) {
          if (!isRequestCancelled(error)) {
            throw error
          }
        }
        return
      }

      reloadApplicationPage()
      return
    }

    await retryLoad()
  }

  return {
    isSessionExpiredError,
    retryButtonLabel,
    handleRetry,
  }
}
