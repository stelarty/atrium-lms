<!-- src/components/ui/Skeleton.vue -->
<template>
  <div class="skeleton" :class="[
    `skeleton--${type}`,
    `skeleton--${size}`,
    `skeleton--${variant}`,
    animated ? 'skeleton--animated' : '',
    block ? 'skeleton--block' : '',
  ]" :style="computedStyle" />
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

defineOptions({ name: 'UiSkeleton' })

type SkeletonType = 'section' | 'rect' | 'circle' | 'text' | 'title' | 'button' | 'input' | 'tab'
type SkeletonSize = 'small' | 'medium' | 'large' | 'full'
type SkeletonVariant = 'default' | 'light'
type SkeletonDimension = string | number | null

const props = withDefaults(
  defineProps<{
    type?: SkeletonType
    size?: SkeletonSize
    variant?: SkeletonVariant
    animated?: boolean
    block?: boolean
    width?: SkeletonDimension
    height?: SkeletonDimension
    radius?: SkeletonDimension
  }>(),
  {
    type: 'rect',
    size: 'medium',
    variant: 'default',
    animated: true,
    block: false,
    width: null,
    height: null,
    radius: null,
  },
)

const normalizeDimension = (value: SkeletonDimension): string | undefined => {
  if (value === null || value === '') return undefined
  if (typeof value === 'number') return `${value}px`

  return value
}

const computedStyle = computed<CSSProperties>(() => {
  return {
    width: normalizeDimension(props.width),
    height: normalizeDimension(props.height),
    borderRadius: normalizeDimension(props.radius),
  }
})
</script>

<style scoped lang="scss">
// Переменные
$base-height: 24px;
$radius-default: $m6;
$radius-round: 50%;

// Анимация
@keyframes pulse {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.skeleton {

  &--default {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    border-radius: $radius-default;
    display: inline-block;

  }

  // ✅ Светлая вариация для белых карточек/панелей
  &--light {
    background: linear-gradient(90deg, #f7f7f7 25%, #e6e6e6 50%, #f7f7f7 75%);
    background-size: 200% 100%;
    border-radius: $radius-default;
    display: inline-block;

  }

  &--animated {
    animation: pulse 1.5s infinite;
  }

  &--section {
    @include border-radius($m12);
    @include responsive-prop(padding, ($container-padding-mobile, $container-padding-tablet, null));
    width: 100%;
    height: 400px; // ← теперь НЕ ПЕРЕБИВАЕТСЯ
  }

  &--rect {
    border-radius: $radius-default;
  }

  &--circle {
    border-radius: $radius-round;
  }

  &--text {
    height: calc($base-height * 0.8);
    border-radius: $radius-default;
  }

  &--title {
    height: calc($base-height * 1.8);
    border-radius: $radius-default;
  }

  &--tab {
    height: 82px;
    @include responsive-prop(height, (40px, 48px, 82px));
    @include responsive-prop(border-radius, ($m5, $m6, $m10));
  }

  &--input {
    height: 40px;
    border-radius: $m4;
  }

  &--small {
    width: 50px;
  }

  &--medium {
    width: 120px;
  }

  &--large {
    width: 200px;
  }

  &--full {
    width: 100%;
  }

  &--block {
    display: block;
  }
}

// Комбинированные стили
.skeleton--text.skeleton--small {
  width: 80px;
}

.skeleton--text.skeleton--medium {
  width: 140px;
}

.skeleton--text.skeleton--large {
  width: 100%;
}

.skeleton--title.skeleton--full,
.skeleton--button.skeleton--full,
.skeleton--input.skeleton--full {
  width: 100%;
}
</style>
