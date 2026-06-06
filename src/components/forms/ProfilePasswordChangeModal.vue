<template>
  <BaseModal v-model="modalValue" title="Изменить пароль" @close="emit('close')">
    <form class="profile-security-modal" @submit.prevent="handleSubmit">
      <BaseInput
        v-model="form.old_password"
        label="Старый пароль"
        type="password"
        placeholder="Введите текущий пароль"
        :error="errors.old_password"
        @update:model-value="clearErrors"
      />

      <BaseInput
        v-model="form.new_password"
        label="Новый пароль"
        type="password"
        placeholder="Введите новый пароль"
        :error="errors.new_password"
        @update:model-value="clearErrors"
      />

      <BaseInput
        v-model="confirmPassword"
        label="Повторите новый пароль"
        type="password"
        placeholder="Повторите новый пароль"
        :error="errors.confirm_password"
        @update:model-value="clearErrors"
      />

      <p v-if="successMessage" class="profile-security-modal__success">
        {{ successMessage }}
      </p>

      <BaseButton
        type="contained"
        variant="primary"
        native-type="submit"
        width="fit"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? 'Сохранение...' : 'Сохранить' }}
      </BaseButton>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import type { ChangePasswordPayload } from '@/api/types/profile'

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
  (event: 'submit', payload: ChangePasswordPayload): void
}>()

const form = reactive<ChangePasswordPayload>({
  old_password: '',
  new_password: '',
})
const confirmPassword = ref('')
const successMessage = ref('')
const errors = reactive({
  old_password: '',
  new_password: '',
  confirm_password: '',
})

const modalValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

function clearErrors(): void {
  errors.old_password = ''
  errors.new_password = ''
  errors.confirm_password = ''
  successMessage.value = ''
}

function setError(message: string): void {
  errors.new_password = message
  successMessage.value = ''
}

function markSuccess(): void {
  successMessage.value = 'Пароль успешно изменён'
  form.old_password = ''
  form.new_password = ''
  confirmPassword.value = ''
}

function handleSubmit(): void {
  clearErrors()

  if (!form.old_password) {
    errors.old_password = 'Введите старый пароль'
  }

  if (!form.new_password) {
    errors.new_password = 'Введите новый пароль'
  }

  if (!confirmPassword.value) {
    errors.confirm_password = 'Повторите новый пароль'
  }

  if (form.new_password && confirmPassword.value && form.new_password !== confirmPassword.value) {
    errors.confirm_password = 'Пароли не совпадают'
  }

  if (errors.old_password || errors.new_password || errors.confirm_password) {
    return
  }

  emit('submit', { ...form })
}

watch(
  () => props.modelValue,
  (opened) => {
    if (!opened) {
      form.old_password = ''
      form.new_password = ''
      confirmPassword.value = ''
      clearErrors()
    }
  },
)

defineExpose({ setError, markSuccess })
</script>

<style scoped lang="scss">
@import '@/styles/components/_profile-security-modal';
</style>
