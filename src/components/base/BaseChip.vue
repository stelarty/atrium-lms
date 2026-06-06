<template>
  <component
    :is="componentTag"
    v-bind="componentProps"
    :class="['base-chip', `base-chip--${resolvedVariant}`]"
  >
    <slot>{{ label }}</slot>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/** DS LMS Chip — Figma node 2457:222 */
export type BaseChipVariant = 'success' | 'warning' | 'danger' | 'additional' | 'neutral'

/** @deprecated Use `additional` — kept for homework status mappers */
export type BaseChipVariantAlias = BaseChipVariant | 'accent'

const props = withDefaults(
  defineProps<{
    label?: string
    variant?: BaseChipVariantAlias
    href?: string
    target?: '_self' | '_blank'
    title?: string
  }>(),
  {
    variant: 'neutral',
    target: '_blank',
  },
)

const resolvedVariant = computed((): BaseChipVariant => {
  return props.variant === 'accent' ? 'additional' : props.variant
})

const componentTag = computed(() => (props.href ? 'a' : 'span'))

const componentProps = computed(() => {
  if (!props.href) {
    return props.title ? { title: props.title } : {}
  }

  return {
    href: props.href,
    target: props.target,
    rel: props.target === '_blank' ? 'noopener noreferrer' : undefined,
    title: props.title ?? props.href,
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/components/_base-chip.scss';
</style>
