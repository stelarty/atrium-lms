<!-- src/components/base/BaseInput.vue -->
<template>
  <label
    class="base-input"
    :class="{
      'base-input--disabled': disabled,
      'base-input--error': Boolean(error),
    }"
  >
    <span v-if="label" class="base-input__label">{{ label }}</span>

    <!-- ✅ Обёртка для позиционирования иконки -->
    <div class="base-input__wrapper" :class="{ 'base-input__wrapper--search': isSearch }">
      <UiIcon
        v-if="isSearch"
        name="search"
        size="16"
        class="base-input__search-icon"
      />
      
      <input
        :id="inputId"
        class="base-input__control"
        :class="{ 'base-input__control--search': isSearch }"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-invalid="Boolean(error)"
        @input="handleInput"
        @blur="handleBlur"
      />
    </div>

    <span v-if="error" class="base-input__message base-input__message--error">{{ error }}</span>
    <span v-else-if="hint" class="base-input__message">{{ hint }}</span>
  </label>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import UiIcon from '@/components/ui/UiIcon.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    placeholder?: string
    type?: 'text' | 'url' | 'number' | 'search' | 'time' | 'email' | 'password'
    disabled?: boolean
    error?: string | null
    hint?: string
  }>(),
  {
    modelValue: '',
    label: '',
    placeholder: '',
    type: 'text',
    disabled: false,
    error: null,
    hint: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur', event: FocusEvent): void
}>()

const inputId = `base-input-${getCurrentInstance()?.uid ?? 'default'}`
const isSearch = computed(() => props.type === 'search')

function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}
</script>

<style scoped lang="scss">
@import '@/styles/components/_base-input';
</style>