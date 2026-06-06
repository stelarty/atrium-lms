<!-- src/components/forms/ProfileEditModal.vue -->
<template>
  <BaseModal
    v-model="modalValue"
    title="Редактирование профиля"
    @close="emit('close')"
  >
    <form class="profile-edit-modal__form" @submit.prevent="handleSubmit">
      <div class="profile-edit-modal__body">
        <div class="profile-edit-modal__grid">
          <BaseInput
            :model-value="localForm.name"
            label="Имя"
            placeholder="Иван"
            :error="errors.name"
            @update:model-value="updateName"
          />

          <BaseInput
            :model-value="localForm.surname"
            label="Фамилия"
            placeholder="Иванов"
            :error="errors.surname"
            @update:model-value="updateSurname"
          />
        </div>

        <BaseInput
          v-model="localForm.grade"
          label="Класс"
          type="number"
          placeholder="9"
          :error="errors.grade"
        />

        <BaseInput
          :model-value="localForm.phone"
          label="Номер телефона студента"
          placeholder="+7 999 123 45 67"
          :error="errors.phone"
          @update:model-value="updatePhone"
        />
      </div>

      <footer class="profile-edit-modal__footer">
        <BaseButton type="contained" variant="primary" native-type="submit">
          Сохранить
        </BaseButton>
      </footer>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'

interface Props {
  modelValue: boolean
  initialData: {
    name: string
    surname: string
    grade: string
    phone: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  initialData: () => ({
    name: '',
    surname: '',
    grade: '',
    phone: '',
  }),
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'save', data: typeof props.initialData): void
}>()

const localForm = ref({ ...props.initialData })
const modalValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

// Ошибки от бэкенда
const errors = ref<Partial<Record<keyof typeof props.initialData, string>>>({
  name: '',
  surname: '',
  grade: '',
  phone: '',
})

// Сброс ошибок
const clearErrors = () => {
  errors.value = { name: '', surname: '', grade: '', phone: '' }
}

const updateName = (value: string): void => {
  localForm.value.name = value.replace(/[^a-zA-Zа-яА-ЯёЁ]/g, '')
  clearErrors()
}

const updateSurname = (value: string): void => {
  localForm.value.surname = value.replace(/[^a-zA-Zа-яА-ЯёЁ]/g, '')
  clearErrors()
}

const updatePhone = (value: string): void => {
  const normalizedValue = value.replace(/[^+\d]/g, '')
  if ((normalizedValue.match(/\+/g) || []).length > 1) {
    localForm.value.phone = `+${normalizedValue.slice(1).replace(/\+/g, '')}`
  } else {
    localForm.value.phone = normalizedValue
  }
  clearErrors()
}

// Сброс формы и ошибок при обновлении данных
watch(
  () => props.initialData,
  (newVal) => {
    Object.assign(localForm.value, newVal)
    clearErrors()
  },
  { immediate: true }
)

// Метод для установки ошибок извне (из ProfileView)
const setBackendErrors = (backendErrors: Record<string, string[]>) => {
  clearErrors()
  for (const key in backendErrors) {
    if (
      (key === 'name' || key === 'surname' || key === 'grade' || key === 'phone') &&
      Array.isArray(backendErrors[key]) &&
      backendErrors[key].length > 0
    ) {
      errors.value[key] = backendErrors[key][0]
    }
  }
}

defineExpose({ setBackendErrors })

const handleSubmit = () => {
  clearErrors()
  emit('save', localForm.value)
}
</script>

<style scoped lang="scss">
@import '@/styles/components/_modal-profile-edit';
</style>
