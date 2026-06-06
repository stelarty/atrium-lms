<template>
  <BaseModal
    v-model="modalValue"
    :title="modalTitle"
    :hide-header="isResultState"
    @close="emit('close')"
  >
    <form
      class="profile-security-modal"
      :class="{ 'profile-security-modal--result': isResultState }"
      @submit.prevent="handleSubmit"
    >
      <template v-if="status === 'form'">
        <BaseInput
          v-model="email"
          label="Новый email"
          type="email"
          placeholder="example@email.com"
          :error="localError"
          @update:model-value="clearLocalError"
        />

        <BaseButton
          type="contained"
          variant="primary"
          native-type="submit"
          width="fit"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Отправка...' : 'Подтвердить' }}
        </BaseButton>
      </template>

      <p v-else-if="status === 'request-sent'" class="profile-security-modal__success">
        Письмо с подтверждением отправлено на ваш новый email. Перейдите по ссылке в письме
      </p>

      <div v-else-if="status === 'confirming'" class="profile-security-modal__result">
        <span class="profile-security-modal__result-icon profile-security-modal__result-icon--pending">
          <UiIcon name="autorenew" size="32" />
        </span>
        <h2 class="profile-security-modal__result-title">Подтверждаем новый email...</h2>
      </div>

      <div v-else-if="status === 'confirmed'" class="profile-security-modal__result">
        <span class="profile-security-modal__result-icon profile-security-modal__result-icon--success">
          <UiIcon name="check" size="32" />
        </span>

        <h2 class="profile-security-modal__result-title">
          Новый email успешно<br />
          подтвержден
        </h2>

        <BaseButton type="contained" variant="primary" width="fit" @click="modalValue = false">
          Вернуться на платформу
        </BaseButton>
      </div>

      <div v-else class="profile-security-modal__result">
        <span class="profile-security-modal__result-icon profile-security-modal__result-icon--error">
          <UiIcon name="warning" size="32" />
        </span>

        <h2 class="profile-security-modal__result-title">Не удалось подтвердить email</h2>

        <p class="profile-security-modal__result-message">
          {{ localError || 'Не удалось подтвердить email' }}
        </p>

        <BaseButton type="contained" variant="primary" width="fit" @click="modalValue = false">
          Вернуться на платформу
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import UiIcon from '@/components/ui/UiIcon.vue'

type EmailChangeStatus = 'form' | 'request-sent' | 'confirming' | 'confirmed' | 'confirm-error'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    isSubmitting?: boolean
  }>(),
  {
    isSubmitting: false,
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'close'): void
  (event: 'submit', email: string): void
}>()

const email = ref('')
const localError = ref<string | null>(null)
const status = ref<EmailChangeStatus>('form')

const modalValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})
const isResultState = computed(() =>
  status.value === 'confirming' || status.value === 'confirmed' || status.value === 'confirm-error',
)
const modalTitle = computed(() => {
  if (status.value === 'confirmed') {
    return 'Новый email успешно подтвержден'
  }

  if (status.value === 'confirm-error') {
    return 'Не удалось подтвердить email'
  }

  if (status.value === 'confirming') {
    return 'Подтверждаем новый email'
  }

  return 'Изменение email'
})

function clearLocalError(): void {
  localError.value = null
}

function setError(message: string): void {
  localError.value = message
  status.value = 'form'
}

function markSuccess(): void {
  status.value = 'request-sent'
  email.value = ''
  localError.value = null
}

function startConfirmation(): void {
  status.value = 'confirming'
  email.value = ''
  localError.value = null
}

function markConfirmationSuccess(): void {
  status.value = 'confirmed'
  localError.value = null
}

function setConfirmationError(message: string): void {
  status.value = 'confirm-error'
  localError.value = message
}

function handleSubmit(): void {
  clearLocalError()

  if (!email.value.trim()) {
    localError.value = 'Введите новый email'
    return
  }

  emit('submit', email.value.trim())
}

watch(
  () => props.modelValue,
  (opened) => {
    if (!opened) {
      email.value = ''
      localError.value = null
      status.value = 'form'
    }
  },
)

defineExpose({ setError, markSuccess, startConfirmation, markConfirmationSuccess, setConfirmationError })
</script>

<style scoped lang="scss">
@import '@/styles/components/_profile-security-modal';
</style>
