<template>
  <component
    :is="componentTag"
    v-bind="componentProps"
    :class="[
      'base-button',
      `base-button--${variant}`,
      `base-button--${type}`,
      `base-button--${width}`,
      { 'base-button--disabled': disabled },
    ]"
    @click="handleClick"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { provide, computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'error'
    type?: 'contained' | 'text'
    disabled?: boolean
    width?: 'full' | 'fit' | 'adaptive'

    /** navigation */
    to?: RouteLocationRaw
    href?: string
    target?: '_self' | '_blank'
    nativeType?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    type: 'contained',
    disabled: false,
    target: '_self',
    nativeType: 'button',
    width: 'adaptive',
  },
)

// provide цвет для всех UiIcon внутри
provide('baseIconColor', 'currentColor')

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const isRouterLink = computed(() => Boolean(props.to))
const isAnchor = computed(() => Boolean(props.href) && !props.to)
const isButton = computed(() => !props.to && !props.href)

const componentTag = computed(() => {
  if (isRouterLink.value) return RouterLink
  if (isAnchor.value) return 'a'
  return 'button'
})

const componentProps = computed(() => {
  if (isRouterLink.value) {
    return {
      to: props.to,
      custom: false,
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
    type: props.nativeType,
    disabled: props.disabled,
  }
})

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
@import '@/styles/components/_base-button.scss';
</style>
