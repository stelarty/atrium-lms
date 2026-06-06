<!-- BaseBanner.vue -->
<template>
  <section
    v-if="!isDismissed"
    class="base-banner"
    :class="{ 'base-banner--dismissible': dismissible }"
    role="region"
    :ariaLabel="ariaLabel"
  >
    <!-- Body: рендерим обёртку, если передан default-слот ИЛИ есть пропсы title/description -->
    <div v-if="$slots.default || title || description" class="base-banner__body">
      <slot>
        <!-- Fallback: если default-слот не передан, рисуем title/description -->
        <div v-if="title" class="base-banner__title">
          <slot name="title">{{ title }}</slot>
        </div>
        <div v-if="description" class="base-banner__description">
          <slot name="description">{{ description }}</slot>
        </div>
      </slot>
    </div>

    <!-- Media -->
    <div v-if="$slots.media || imageSrc" class="base-banner__media">
      <slot name="media">
        <img v-if="imageSrc" class="base-banner__img" :src="imageSrc" :alt="imageAlt" />
      </slot>
    </div>

    <!-- Actions -->
    <div v-if="$slots.actions" class="base-banner__actions">
      <slot name="actions" />
    </div>

    <!-- Close -->
    <BaseIconButton
      v-if="dismissible"
      class="base-banner__close"
      variant="secondary"
      type="contained"
      :ariaLabel="closeLabel"
      @click="handleDismiss"
    >
      <UiIcon name="close" color="currentColor" />
    </BaseIconButton>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import BaseIconButton from '@/components/base/BaseIconButton.vue'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    imageSrc?: string
    imageAlt?: string
    dismissible?: boolean
    sessionDismissKey?: string
    ariaLabel?: string
    closeLabel?: string
  }>(),
  {
    title: '',
    description: '',
    imageSrc: '',
    imageAlt: '',
    dismissible: true,
    sessionDismissKey: '',
    ariaLabel: 'Баннер',
    closeLabel: 'Закрыть',
  },
)

const emit = defineEmits<{ dismiss: [] }>()
const isDismissed = ref(false)

const readDismissedFromSession = (): void => {
  const key = props.sessionDismissKey?.trim()
  if (!key || typeof sessionStorage === 'undefined') {
    isDismissed.value = false
    return
  }
  isDismissed.value = sessionStorage.getItem(key) === '1'
}

watch(() => props.sessionDismissKey, readDismissedFromSession, { immediate: true })

const handleDismiss = (): void => {
  const key = props.sessionDismissKey?.trim()
  if (key && typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(key, '1')
  }
  isDismissed.value = true
  emit('dismiss')
}
</script>

<style scoped lang="scss">
@import '@/styles/components/_base-banner';
</style>