// src/stores/useOnboardingStore.ts
import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { fetchOnboarding, postOnboardingJoinedTelegram, updateOnboarding } from '@/api/onboarding'
import { getApiErrorMessage } from '@/utils/api-error'
import type { OnboardingResponse } from '@/api/types/onboarding'
import { useUserStore } from '@/stores/useUserStore'
import onboardingWelcomeImage from '@/assets/images/onboarding-welcome.gif'
import onboardingCompleteImage from '@/assets/images/onboarding-complete.png'

interface Task {
  label: string
  status: 'completed' | 'current' | 'pending'
  available: boolean
}

const TASK_LABELS = [
  'Перейти<br>на платформу',
  'В полезных материалах<br>зайти в Telegram группы',
  'Сделать свое первое<br>домашнее задание',
]

export const useOnboardingStore = defineStore('onboarding', () => {
  const userStore = useUserStore()

  const collapsed = ref(false)
  const isLoading = ref(true)
  const isClosing = ref(false)
  const error = ref<string | null>(null)
  const onboardingData = ref<OnboardingResponse | null>(null)
  const tasks = ref<Task[]>(
    TASK_LABELS.map((label) => ({ label, status: 'pending' as const, available: false })),
  )

  /** Ученик (не staff), для которого имеет смысл дергать onboarding API. */
  const isStudentForOnboarding = computed((): boolean => {
    if (!userStore.isInitialized || !userStore.profile) return false
    return userStore.profile.is_staff !== true
  })

  /** Онбординг закрыт пользователем: done + seen — дальше не запрашиваем GET. */
  const isOnboardingTerminal = computed((): boolean => {
    const d = onboardingData.value
    return !!(d && d.onboarding_done === true && d.is_seen === true)
  })

  const allCompleted = computed((): boolean => {
    if (!onboardingData.value) return false
    if (onboardingData.value.onboarding_done === true) return true
    return tasks.value.every((task) => task.status === 'completed')
  })

  const headerImage = computed(() =>
    allCompleted.value ? onboardingCompleteImage : onboardingWelcomeImage,
  )

  const headerTitle = computed(() =>
    allCompleted.value
      ? 'Вы прошли обучение<br>и получили ачивку'
      : 'Добро пожаловать на платформу!',
  )

  const showSubtitle = computed(() => !allCompleted.value)
  const showArrow = computed(() => !allCompleted.value)

  const isLoaded = computed(() => !isLoading.value && onboardingData.value !== null)

  const shouldShow = computed((): boolean => {
    if (!onboardingData.value) return false
    if (onboardingData.value.onboarding_done === false) return true
    return onboardingData.value.is_seen === false
  })

  /** Монтировать виджет/обёртку в DOM (не рендерить пустой host после прохождения). */
  const shouldMountWidget = computed((): boolean => {
    if (!isStudentForOnboarding.value) return false
    if (isOnboardingTerminal.value) return false
    if (userStore.profile?.onboarding_done === true && onboardingData.value === null) {
      return false
    }
    if (isLoading.value) return false
    return shouldShow.value
  })

  const buildTasks = (data: OnboardingResponse): void => {
    if (data.onboarding_done === true) {
      tasks.value = TASK_LABELS.map((label) => ({
        label,
        status: 'completed' as const,
        available: true,
      }))
      return
    }

    const flags = [
      data.step_platform_visited,
      data.step_joined_telegram,
      data.step_completed_first_homework,
    ]

    const statuses: Task['status'][] = flags.map((done) => (done ? 'completed' : 'pending'))
    const firstPending = statuses.findIndex((status) => status === 'pending')
    if (firstPending !== -1) {
      statuses[firstPending] = 'current'
    }

    tasks.value = TASK_LABELS.map((label, index) => {
      const status = statuses[index] ?? 'pending'
      return {
        label,
        status,
        available: status !== 'pending',
      }
    })
  }

  const loadOnboarding = async (): Promise<void> => {
    if (!isStudentForOnboarding.value) {
      isLoading.value = false
      onboardingData.value = null
      return
    }

    if (isOnboardingTerminal.value) {
      isLoading.value = false
      return
    }

    try {
      isLoading.value = true
      error.value = null
      const data = await fetchOnboarding()
      onboardingData.value = data
      buildTasks(data)

      if (data.onboarding_done === true && data.is_seen === true) {
        userStore.mergeProfile({ onboarding_done: true })
      }
    } catch (err) {
      error.value = getApiErrorMessage(err, 'Ошибка запроса')
      console.error('[OnboardingStore] Ошибка загрузки онбординга', err)
    } finally {
      isLoading.value = false
    }
  }

  watch(
    () =>
      [userStore.isInitialized, userStore.profile?.onboarding_done, userStore.profile?.is_staff] as const,
    async (tuple) => {
      const [initialized, , isStaff] = tuple
      if (!initialized) return

      if (!userStore.profile || isStaff === true) {
        isLoading.value = false
        onboardingData.value = null
        return
      }

      if (isOnboardingTerminal.value) {
        isLoading.value = false
        return
      }

      await loadOnboarding()
    },
    { immediate: true },
  )

  const toggle = (): void => {
    if (allCompleted.value) return
    collapsed.value = !collapsed.value
  }

  /** PATCH /edspace/onboarding/ { is_seen: true } при нажатии на крестик; без лишнего GET после успеха. */
  const dismissWithSeen = async (): Promise<void> => {
    try {
      isClosing.value = true
      error.value = null
      await updateOnboarding({ is_seen: true })
      const closed: OnboardingResponse = { onboarding_done: true, is_seen: true }
      onboardingData.value = closed
      buildTasks(closed)
      userStore.mergeProfile({ onboarding_done: true })
    } catch (err) {
      error.value = getApiErrorMessage(err, 'Ошибка запроса')
      console.error('[OnboardingStore] Ошибка PATCH is_seen', err)
    } finally {
      isClosing.value = false
    }
  }

  /**
   * POST /edspace/onboarding/joined-telegram/ — при открытии вкладки «Полезные материалы» (идемпотентно).
   */
  const reportJoinedTelegramIfEligible = async (): Promise<void> => {
    const d = onboardingData.value
    if (!d || d.onboarding_done !== false) return
    try {
      const data = await postOnboardingJoinedTelegram()
      onboardingData.value = data
      buildTasks(data)
    } catch (err) {
      console.error('[OnboardingStore] Ошибка joined-telegram', err)
    }
  }

  const isNextAvailableTask = (index: number): boolean => {
    const currentIndex = tasks.value.findIndex((t) => t.status === 'current')
    if (currentIndex === -1 || index <= currentIndex) return false

    for (let i = currentIndex + 1; i < index; i++) {
      const task = tasks.value[i]
      if (task && task.status !== 'completed') return false
    }

    return true
  }

  return {
    collapsed,
    isLoading,
    isClosing,
    error,
    onboardingData,
    tasks,
    allCompleted,
    headerImage,
    headerTitle,
    showSubtitle,
    showArrow,
    isLoaded,
    shouldShow,
    shouldMountWidget,
    toggle,
    dismissWithSeen,
    reportJoinedTelegramIfEligible,
    isNextAvailableTask,
    loadOnboarding,
    isOnboardingTerminal,
    isStudentForOnboarding,
  }
})
