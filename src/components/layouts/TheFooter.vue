<!-- src/components/layouts/Footer.vue -->
<template>
  <footer class="footer">
    <div class="container footer__inner">
      <RouterLink to="/" class="footer__logo">
        <UiIcon name="logo" :size="logoSize" />
      </RouterLink>
      <p class="footer__version">Версия 1.0</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { useBreakpoints } from '@/composables/useBreakpoints'

const { isMobile } = useBreakpoints()
const logoSize = computed(() => (isMobile.value ? 75 : 100))
</script>

<style scoped lang="scss">
@import '@/styles/components/_layout-footer';
</style>
