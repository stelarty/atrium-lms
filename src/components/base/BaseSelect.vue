<template>
  <div class="base-select" :class="{
    'base-select--disabled': disabled,
    'base-select--error': Boolean(error),
    'base-select--placeholder': currentValue === null,
  }">
    <span v-if="label" class="base-select__label">{{ label }}</span>

    <WidgetDropdown :model-value="selectedItem" :groups="[{ items: dropdownItems }]" :disabled="disabled"
      :placeholder="placeholder" :teleport-panel="teleportPanel" truncate :position="position"
      @update:model-value="handleSelect">
      <template #trigger="{ opened }">
        <span class="base-select__field">
          <span class="base-select__control">
            {{ selectedLabel }}
          </span>
          <UiIcon name="arrow" size="16" :direction="opened ? 'up' : 'down'" class="base-select__icon" />
        </span>
      </template>
    </WidgetDropdown>

    <span v-if="error" class="base-select__message base-select__message--error">{{ error }}</span>
    <span v-else-if="hint" class="base-select__message">{{ hint }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import WidgetDropdown from '@/components/widgets/WidgetDropdown.vue'
import type { DropdownItem } from '@/components/widgets/WidgetDropdown.vue'

export interface BaseSelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    label?: string
    placeholder?: string
    options: BaseSelectOption[]
    disabled?: boolean
    error?: string | null
    hint?: string
    /** Панель дропдауна вне overflow-контейнера (только где явно включено). */
    teleportPanel?: boolean
    position?: 'left' | 'right' // 👈 НОВОЕ
  }>(),
  {
    modelValue: null,
    label: '',
    placeholder: 'Выберите значение',
    disabled: false,
    error: null,
    hint: '',
    teleportPanel: false,
    position: 'left',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
}>()

const dropdownItems = computed<DropdownItem[]>(() =>
  props.options.map((opt) => ({
    id: opt.value,
    label: opt.label,
    disabled: opt.disabled,
  })),
)

const selectedItem = computed<DropdownItem | null>(() => {
  if (props.modelValue === null || props.modelValue === undefined) return null
  return dropdownItems.value.find((item) => item.id === props.modelValue) ?? null
})

const currentValue = computed(() => props.modelValue ?? null)

const selectedLabel = computed(() =>
  selectedItem.value ? selectedItem.value.label : props.placeholder,
)

function handleSelect(item: DropdownItem | DropdownItem[]): void {
  if (Array.isArray(item)) return
  const original = props.options.find((opt) => opt.value === item.id)
  emit('update:modelValue', original ? original.value : null)
}
</script>

<style scoped lang="scss">
@import '@/styles/components/_base-select';
</style>
