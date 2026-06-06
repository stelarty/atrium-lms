<!-- src/components/base/BaseIconButton.vue -->
<template>
  <component
    :is="componentTag"
    v-bind="componentProps"
    :class="[
      'base-icon-button',
      `base-icon-button--${variant}`,
      `base-icon-button--${type}`,
      { 'base-icon-button--disabled': disabled },
    ]"
    :ariaLabel="ariaLabel"
    @click="handleClick"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'error'
    type?: 'contained' | 'text'
    disabled?: boolean
    ariaLabel?: string

    /** navigation */
    to?: RouteLocationRaw
    href?: string
    target?: '_self' | '_blank'
  }>(),
  {
    variant: 'primary',
    type: 'contained',
    disabled: false,
    ariaLabel: 'Иконка-кнопка',
    target: '_self',
  },
)

// provide цвет для всех UiIcon внутри
provide('baseIconColor', 'currentColor')

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

/* ---------- тип элемента ---------- */
const isRouterLink = computed(() => Boolean(props.to))
const isAnchor = computed(() => Boolean(props.href) && !props.to)
const isButton = computed(() => !props.to && !props.href)

const componentTag = computed(() => {
  if (isRouterLink.value) return RouterLink
  if (isAnchor.value) return 'a'
  return 'button'
})

/* ---------- пропсы элемента ---------- */
const componentProps = computed(() => {
  if (isRouterLink.value) {
    return {
      to: props.to,
    }
  }

  if (isAnchor.value) {
    return {
      href: props.href,
      target: props.target,
      rel: props.target === '_blank' ? 'noopener noreferrer' : undefined,
    }
  }

  return {
    type: 'button',
    disabled: props.disabled,
  }
})

/* ---------- клик ---------- */
function handleClick(event: MouseEvent) {
  if (props.disabled) {
    event.preventDefault()
    return
  }

  if (isButton.value) {
    emit('click', event)
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/_base-icon-button.scss';
</style>
