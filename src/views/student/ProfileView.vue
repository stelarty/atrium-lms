<!-- src/views/student/ProfileView.vue -->
<template>
  <div class="view profile-view">
    <!-- Шапка профиля -->
    <section class="section section--no-bg profile-section profile-section__header">
      <div class="profile-section__info">
        <p class="profile-section__role">{{ userStore.profile?.role }}</p>
        <Transition name="slide" mode="out-in" :duration="{ enter: 200, leave: 200 }">
          <Skeleton v-if="!userStore.profile" type="title" size="large" height="40" animated />
          <h1 v-else class="profile-section__title">
            {{ fullName }}
            <button @click="showEditModal = true" class="profile-section__edit button--with-icon">
              <UiIcon name="edit" size="24" />
            </button>
          </h1>
        </Transition>
      </div>
      <div class="profile-section__action">
        <BaseButton type="text" variant="error" :href="logoutHref">Выйти из аккаунта
        </BaseButton>
      </div>
    </section>

    <!-- Блок информации -->
    <section class="section profile-section">
      <WidgetUserInfo
        :profile="userStore.profile"
        :isLoading="userStore.isLoading"
        @edit="showEditModal = true"
        @change-email="showEmailModal = true"
        @change-password="showPasswordModal = true"
      />
    </section>

    <!-- Ачивки (только для студентов) -->
    <section v-if="shouldShowAchievements" class="section section--no-padding section--overflow-hidden profile-section">
      <WidgetAchievements :achievements="userStore.profile?.achievements || []" :isLoading="showAchievementsSkeleton" />
    </section>

    <!-- Курсы -->
    <section class="section profile-section">
      <WidgetCourses :courses="userStore.profile?.courses || []" />
    </section>

    <!-- Модальное окно редактирования -->
    <ProfileEditModal ref="editModalRef" v-model="showEditModal" :initial-data="currentEditData" @save="handleSave" />
    <ProfileEmailChangeModal
      ref="emailModalRef"
      v-model="showEmailModal"
      :is-submitting="userStore.isLoading"
      @submit="handleEmailChange"
    />
    <ProfilePasswordChangeModal
      ref="passwordModalRef"
      v-model="showPasswordModal"
      :is-submitting="userStore.isLoading"
      @submit="handlePasswordChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WidgetUserInfo from '@/components/widgets/WidgetUserInfo.vue'
import WidgetAchievements from '@/components/widgets/WidgetAchievements.vue'
import WidgetCourses from '@/components/widgets/WidgetCourses.vue'
import ProfileEditModal from '@/components/forms/ProfileEditModal.vue'
import ProfileEmailChangeModal from '@/components/forms/ProfileEmailChangeModal.vue'
import ProfilePasswordChangeModal from '@/components/forms/ProfilePasswordChangeModal.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { useUserStore } from '@/stores/useUserStore'
import type { ChangePasswordPayload, EditProfilePayload } from '@/api/types/profile'
import BaseButton from '@/components/base/BaseButton.vue'
import { getApiErrorMessage } from '@/utils/api-error'
import { buildPotokLogoutUrl } from '@/utils/env'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const logoutHref = computed(() => buildPotokLogoutUrl())
const showEditModal = ref(false)
const showEmailModal = ref(false)
const showPasswordModal = ref(false)
const editModalRef = ref<{ setBackendErrors: (errors: Record<string, string[]>) => void } | null>(
  null,
)
const emailModalRef = ref<{
  setError: (message: string) => void
  markSuccess: () => void
  startConfirmation: () => void
  markConfirmationSuccess: () => void
  setConfirmationError: (message: string) => void
} | null>(null)
const passwordModalRef = ref<{ setError: (message: string) => void; markSuccess: () => void } | null>(
  null,
)

const currentEditData = computed(() => {
  const p = userStore.profile
  return {
    name: p?.name || '',
    surname: p?.surname || '',
    grade: p?.grade || '',
    phone: p?.phone || '',
  }
})

const fullName = computed(() => {
  const p = userStore.profile
  if (!p) return ''
  return `${p.name} ${p.surname}`
})

const shouldShowAchievements = computed(() => {
  const role = localStorage.getItem('role') as 'student' | 'teacher' | null
  return role !== 'teacher'
})

const showAchievementsSkeleton = computed(() => {
  return userStore.isLoading && !userStore.isInitialized && !userStore.profile
})

const handleSave = async (formData: EditProfilePayload) => {
  try {
    await userStore.updateProfileData(formData)
    showEditModal.value = false
  } catch (rawError: unknown) {
    const error = rawError as { response?: { data?: Record<string, string[]> } }
    if (error.response?.data) {
      editModalRef.value?.setBackendErrors(error.response.data)
    }
  }
}

const profileFieldErrorKeys = ['new_email', 'old_password', 'new_password']

const handleEmailChange = async (email: string) => {
  try {
    await userStore.requestProfileEmailChange(email)
    emailModalRef.value?.markSuccess()
  } catch (rawError: unknown) {
    emailModalRef.value?.setError(
      getApiErrorMessage(rawError, 'Ошибка при смене email', profileFieldErrorKeys),
    )
  }
}

const handlePasswordChange = async (payload: ChangePasswordPayload) => {
  try {
    await userStore.changeProfilePassword(payload)
    passwordModalRef.value?.markSuccess()
  } catch (rawError: unknown) {
    passwordModalRef.value?.setError(
      getApiErrorMessage(rawError, 'Ошибка при смене пароля', profileFieldErrorKeys),
    )
  }
}

const getSingleQueryValue = (value: unknown): string => {
  if (Array.isArray(value)) return String(value[0] || '')
  return typeof value === 'string' ? value : ''
}

const clearEmailConfirmationQuery = async (): Promise<void> => {
  const nextQuery = { ...route.query }
  delete nextQuery.email_change_uid
  delete nextQuery.email_change_token
  delete nextQuery.email

  await router.replace({ query: nextQuery })
}

const handleEmailConfirmationFromQuery = async (): Promise<void> => {
  const uid = getSingleQueryValue(route.query.email_change_uid)
  const token = getSingleQueryValue(route.query.email_change_token)
  const email = getSingleQueryValue(route.query.email)

  if (!uid && !token && !email) return

  showEmailModal.value = true
  emailModalRef.value?.startConfirmation()

  if (!uid || !token || !email) {
    emailModalRef.value?.setConfirmationError('Некорректная ссылка подтверждения')
    await clearEmailConfirmationQuery()
    return
  }

  const result = await userStore.confirmProfileEmailChange(uid, token, email)

  if (result.success) {
    emailModalRef.value?.markConfirmationSuccess()
  } else {
    emailModalRef.value?.setConfirmationError(result.message || 'Ошибка при подтверждении email')
  }

  await clearEmailConfirmationQuery()
}

onMounted(() => {
  void handleEmailConfirmationFromQuery()
})
</script>

<style scoped lang="scss">
@import '@/styles/pages/_profile-view';
</style>
