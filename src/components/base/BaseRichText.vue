<template>
  <div
    class="base-rich-text"
    :class="{ 'base-rich-text--materials-comment': variant === 'materials-comment' }"
    v-html="html"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { linkifyPlainTextToHtml } from '@/utils/linkify-plain-text'

const props = withDefaults(
  defineProps<{
    text: string
    variant?: 'default' | 'materials-comment'
  }>(),
  {
    variant: 'default',
  },
)

const html = computed(() => linkifyPlainTextToHtml(props.text))
</script>

<style scoped lang="scss">
@import '@/styles/components/_base-rich-text';
</style>
