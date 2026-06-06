<template>
  <label
    class="base-checkbox"
    :class="{
      'base-checkbox--checked': checked,
      'base-checkbox--disabled': disabled,
    }"
  >
    <input
      type="checkbox"
      class="base-checkbox__input"
      :checked="checked"
      :disabled="disabled"
      @change="onChange"
    />

    <span class="base-checkbox__control">
      <UiIcon v-if="checked" name="check" size="12" color="#fff" />
    </span>
  </label>
</template>

<script setup lang="ts">
import UiIcon from '@/components/ui/UiIcon.vue'

withDefaults(
  defineProps<{
    checked?: boolean
    disabled?: boolean
  }>(),
  {
    checked: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  (e: 'update:checked', value: boolean): void
}>()

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:checked', target.checked)
}
</script>

<style scoped lang="scss">
@import '@/styles/components/_base-checkbox.scss';
</style>
