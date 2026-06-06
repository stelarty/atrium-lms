import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useRoute } from 'vue-router'
import { useCourseStore } from '@/stores/useCourseStore'
import { useCourseWorkersStore } from '@/stores/useCourseWorkersStore'
import { useCourseMaterials } from '@/composables/useCourseMaterials'
import type { BaseSelectOption } from '@/components/base/BaseSelect.vue'

export type SettingsTabId = 'general' | 'roles'
type PaymentMode = 'none' | 'blocks' | 'months'

const settingsTabs = [
  { id: 'general', label: 'Общее' },
  { id: 'roles', label: 'Роли' },
]

export const subjectOptions: BaseSelectOption[] = [
  { value: 'biology', label: 'Биология' },
  { value: 'chemistry', label: 'Химия' },
  { value: 'mathematics', label: 'Математика' },
]

export const partsCountOptions: BaseSelectOption[] = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: `${index + 1}`,
})).filter((option) => option.value >= 2)

export const monthOptions: BaseSelectOption[] = [
  { value: '1', label: 'Январь' },
  { value: '2', label: 'Февраль' },
  { value: '3', label: 'Март' },
  { value: '4', label: 'Апрель' },
  { value: '5', label: 'Май' },
  { value: '6', label: 'Июнь' },
  { value: '7', label: 'Июль' },
  { value: '8', label: 'Август' },
  { value: '9', label: 'Сентябрь' },
  { value: '10', label: 'Октябрь' },
  { value: '11', label: 'Ноябрь' },
  { value: '12', label: 'Декабрь' },
]

const PAYMENT_TABS: Array<{ id: PaymentMode; label: string }> = [
  { id: 'none', label: 'Без деления' },
  { id: 'blocks', label: 'По блокам' },
  { id: 'months', label: 'По месяцам' },
]

const ALLOWED_ACCEPT =
  '.mp3,.mp4,.pdf,.ppt,.pptx,.txt,.doc,.docx,.rtf,.odt,.djvu,.jpg,.jpeg,.png,.webp,.gif'

function isGeneralTabDataReady(courseId: number): boolean {
  const courseStore = useCourseStore()
  if (courseStore.isDraftMode) return true
  if (!Number.isFinite(courseId) || courseId <= 0) return false
  return Number(courseStore.createdCourse?.id) === courseId
}

/** Оболочка: табы и сброс на «Общее» при смене courseId в маршруте */
export function useTeacherCourseSettings() {
  const route = useRoute()
  const activeTab = ref<SettingsTabId>('general')

  watch(
    () => route.params.id,
    () => {
      activeTab.value = 'general'
    },
  )

  return {
    activeTab,
    settingsTabs,
  }
}

/**
 * Загрузка данных только активной вкладки.
 * Скелетоны рендерить в TeacherCourseSettingsView внутри v-if по activeTab.
 */
export function useTeacherCourseSettingsTabsLoader(
  courseId: MaybeRefOrGetter<number>,
  activeTab: MaybeRefOrGetter<SettingsTabId>,
) {
  const courseStore = useCourseStore()
  const workersStore = useCourseWorkersStore()

  const generalLoading = ref(false)
  const rolesLoading = ref(false)

  const resolveCourseId = (): number => toValue(courseId)
  const resolveTab = (): SettingsTabId => toValue(activeTab)

  const showGeneralSkeleton = computed(() => resolveTab() === 'general' && generalLoading.value)
  const showRolesSkeleton = computed(() => resolveTab() === 'roles' && rolesLoading.value)

  async function loadGeneralTab(force = false): Promise<void> {
    if (courseStore.isDraftMode) return

    const id = resolveCourseId()
    if (!Number.isFinite(id) || id <= 0) return

    if (!force && isGeneralTabDataReady(id)) return

    await courseStore.loadCourseById(id, force)
  }

  async function loadRolesTab(force = false): Promise<void> {
    const id = resolveCourseId()
    if (!Number.isFinite(id) || id <= 0) return

    if (!force && workersStore.hydratedForCourseId === id) return

    await workersStore.ensureWorkersLoaded(id, { force })
  }

  let loadGeneration = 0

  watch(
    [() => resolveTab(), () => resolveCourseId()],
    async ([tab, id], [, prevId]) => {
      const generation = ++loadGeneration
      const numericId = Number(id)
      const courseChanged = prevId !== undefined && prevId !== id

      if (tab === 'general') {
        rolesLoading.value = false

        if (courseStore.isDraftMode || !numericId) {
          generalLoading.value = false
          return
        }

        const needsFetch = courseChanged || !isGeneralTabDataReady(numericId)
        if (!needsFetch) {
          generalLoading.value = false
          return
        }

        generalLoading.value = true
        try {
          await loadGeneralTab(courseChanged)
        } finally {
          if (generation === loadGeneration && resolveTab() === 'general') {
            generalLoading.value = false
          }
        }
        return
      }

      if (tab === 'roles') {
        generalLoading.value = false

        if (!numericId) {
          rolesLoading.value = false
          return
        }

        const needsFetch = courseChanged || workersStore.hydratedForCourseId !== numericId
        if (!needsFetch) {
          rolesLoading.value = false
          return
        }

        rolesLoading.value = true
        try {
          await loadRolesTab(courseChanged)
        } finally {
          if (generation === loadGeneration && resolveTab() === 'roles') {
            rolesLoading.value = false
          }
        }
      }
    },
    { immediate: true },
  )

  return {
    showGeneralSkeleton,
    showRolesSkeleton,
  }
}

/** Вкладка «Общее»: форма и материалы. Загрузка — через useTeacherCourseSettingsTabsLoader. */
export function useTeacherCourseGeneralTab(courseId: MaybeRefOrGetter<number>) {
  const courseStore = useCourseStore()

  const {
    materials,
    uploadError,
    uploadFiles,
    removeFile,
    getFileIds,
    setExistingMaterials,
    clearMaterials,
  } = useCourseMaterials()

  const resolveCourseId = (): number => toValue(courseId)

  const paymentMode = computed<PaymentMode>(() => {
    if (courseStore.draftSettings.salesMode === 'months') return 'months'
    if (courseStore.draftSettings.partsCount === '1') return 'none'
    return 'blocks'
  })

  const canEditPartsCount = computed(() => paymentMode.value !== 'none')
  const shouldShowMonthFrom = computed(() => paymentMode.value === 'months')

  const isSaving = computed(() => courseStore.isSaving)
  const error = computed(() => courseStore.saveError)

  const hasActiveUploads = computed(() =>
    materials.value.some(
      (item) =>
        item.status === 'pending' || item.status === 'uploading' || item.status === 'finalizing',
    ),
  )

  watch(
    () => [courseStore.createdCourse?.id, courseStore.createdCourse?.materials] as const,
    ([loadedId, serverMaterials], previousValue) => {
      const previousCourseId = previousValue?.[0]
      const expectedId = resolveCourseId()

      if (courseStore.isDraftMode) {
        if (serverMaterials) {
          setExistingMaterials(serverMaterials)
        }
        return
      }

      if (!expectedId || Number(loadedId) !== expectedId) {
        if (previousCourseId && Number(previousCourseId) !== expectedId) {
          clearMaterials()
        }
        return
      }

      if (serverMaterials) {
        setExistingMaterials(serverMaterials)
        return
      }

      if (previousCourseId && previousCourseId !== loadedId) {
        clearMaterials()
      }
    },
    { immediate: true },
  )

  function handlePaymentModeUpdate(value: string | number): void {
    const paymentValue = value as PaymentMode

    if (paymentValue === 'blocks') {
      courseStore.draftSettings.partsCount = '2'
    } else if (paymentValue === 'none') {
      courseStore.draftSettings.partsCount = '1'
    }

    courseStore.draftSettings.salesMode = paymentValue === 'months' ? 'months' : 'blocks'
  }

  async function handleSave(): Promise<void> {
    if (hasActiveUploads.value) return
    await courseStore.saveCourseSettings(getFileIds())
  }

  return {
    draftSettings: courseStore.draftSettings,
    fieldErrors: courseStore.fieldErrors,
    isSaving,
    error,
    subjectOptions,
    partsCountOptions,
    monthOptions,
    paymentMode,
    canEditPartsCount,
    shouldShowMonthFrom,
    paymentTabs: PAYMENT_TABS,
    materials,
    materialsUploadError: uploadError,
    allowedAccept: ALLOWED_ACCEPT,
    uploadFiles,
    removeFile,
    hasActiveUploads,
    handlePaymentModeUpdate,
    handleSave,
  }
}
