<template>
  <label
    class="base-date"
    :class="{
      'base-date--disabled': disabled,
      'base-date--error': Boolean(error),
      'base-date--placeholder': !modelValue,
    }"
  >
    <span v-if="label" class="base-date__label">{{ label }}</span>

    <span class="base-date__field">
      <input
        :id="inputId"
        class="base-date__control"
        type="date"
        :value="modelValue || ''"
        :min="min"
        :max="max"
        :disabled="disabled"
        :aria-invalid="Boolean(error)"
        @input="handleInput"
        @blur="handleBlur"
      />

      <UiIcon name="calendar" size="16" class="base-date__icon" />
    </span>

    <span v-if="error" class="base-date__message base-date__message--error">{{ error }}</span>
    <span v-else-if="hint" class="base-date__message">{{ hint }}</span>
  </label>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue'
import UiIcon from '@/components/ui/UiIcon.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    label?: string
    placeholder?: string
    min?: string
    max?: string
    disabled?: boolean
    error?: string | null
    hint?: string
  }>(),
  {
    modelValue: null,
    label: '',
    placeholder: '',
    min: '',
    max: '',
    disabled: false,
    error: null,
    hint: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'blur', event: FocusEvent): void
}>()

const inputId = `base-date-${getCurrentInstance()?.uid ?? 'default'}`

function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value || null)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}
</script>

<style scoped lang="scss">
@import '@/styles/components/_base-date';
</style>
