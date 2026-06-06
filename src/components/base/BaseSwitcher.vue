<template>
  <label class="base-switcher" :class="{ 'base-switcher--checked': modelValue }">
    <input
      class="base-switcher__input"
      type="checkbox"
      :checked="modelValue"
      @change="handleChange"
    />

    <span v-if="label || hint" class="base-switcher__content">
      <div class="base-switcher__content-top">
        <span class="base-switcher__switch">
          <span class="base-switcher__thumb"></span>
        </span>
        <span v-if="label" class="base-switcher__label">{{ label }}</span>
      </div>
      <span v-if="hint" class="base-switcher__hint">{{ hint }}</span>
    </span>
  </label>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: boolean
    label?: string
    hint?: string
  }>(),
  {
    modelValue: false,
    label: '',
    hint: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function handleChange(event: Event): void {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<style scoped lang="scss">
.base-switcher {
  display: flex;
  align-items: flex-start;
  gap: $m4;
  cursor: pointer;

  &__input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  &__switch {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    width: 32px;
    height: 18px;
    padding: $m1;
    border-radius: $radius-full;
    background-color: $surface-default-secondary;
    transition: background-color 0.2s ease;
  }

  &__thumb {
    width: 14px;
    height: 14px;
    border-radius: $radius-full;
    background-color: $surface-default-primary;
    transition: transform 0.2s ease;
  }

  &__content {
    @include flex-center(column, flex-start, flex-start);
    gap: $m4;

    &-top {
      @include flex-center(row, flex-start, space-between);
      gap: $m4;
    }
  }

  &__label {
    @include font-body-text();
    color: $text-default-primary;
  }

  &__hint {
    @include font-body-caption();
    color: $text-default-secondary;
  }

  &--checked {
    .base-switcher__switch {
      background-color: $surface-default-accent;
    }

    .base-switcher__thumb {
      transform: translateX(14px);
    }
  }
}
</style>
