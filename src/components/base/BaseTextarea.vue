<template>
  <label
    class="base-textarea"
    :class="{
      'base-textarea--disabled': disabled,
      'base-textarea--error': Boolean(error),
      'base-textarea--readonly': readonly,
    }"
  >
    <span v-if="label" class="base-textarea__label">
      {{ label }}
      <span v-if="required" class="base-textarea__required" aria-hidden="true">*</span>
    </span>

    <div class="base-textarea__inner">
      <textarea
        :id="textareaId"
        class="base-textarea__control"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :rows="rows"
        :aria-invalid="Boolean(error)"
        :aria-required="required"
        @input="handleInput"
        @blur="handleBlur"
      />

      <span v-if="showCounter" class="base-textarea__counter" aria-hidden="true">
        {{ modelValue.length }}
      </span>
    </div>

    <span v-if="error" class="base-textarea__message base-textarea__message--error">{{ error }}</span>
    <span v-else-if="resolvedHint" class="base-textarea__message">{{ resolvedHint }}</span>
  </label>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    error?: string | null
    hint?: string
    maxlength?: number
    /** Show character counter inside the field (DS optional) */
    counter?: boolean
    /** Append `current/max` to hint when maxlength is set */
    showLengthHint?: boolean
    rows?: number
  }>(),
  {
    modelValue: '',
    label: '',
    placeholder: '',
    disabled: false,
    readonly: false,
    required: false,
    error: null,
    hint: '',
    counter: false,
    showLengthHint: true,
    rows: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur', event: FocusEvent): void
}>()

const textareaId = `base-textarea-${getCurrentInstance()?.uid ?? 'default'}`

const showCounter = computed(() => props.counter && props.maxlength !== undefined)

const resolvedHint = computed(() => {
  if (props.hint) return props.hint

  if (
    props.maxlength !== undefined &&
    props.showLengthHint &&
    !props.error
  ) {
    return `${props.modelValue.length}/${props.maxlength}`
  }

  return ''
})

function handleInput(event: Event): void {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}
</script>

<style scoped lang="scss">
@import '@/styles/components/_base-textarea';
</style>
