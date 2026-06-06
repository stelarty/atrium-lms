<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout-shell">
    <WidgetCourseChatBanner v-if="showStudentShellWidgets" />

    <div class="main-layout">
      <TheHeader />

      <main class="main-layout__content">
        <div class="container main-layout__inner main-layout__page">
          <RouterView v-slot="{ Component, route }">
            <Transition name="slide" mode="out-in" :duration="{ enter: 300, leave: 300 }">
              <component :is="Component" :key="route.fullPath" />
            </Transition>
          </RouterView>
        </div>
      </main>

      <TheFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import TheHeader from '@/components/layouts/TheHeader.vue'
import TheFooter from '@/components/layouts/TheFooter.vue'
import WidgetCourseChatBanner from '@/components/widgets/WidgetCourseChatBanner.vue'
import { useStudentShellWidgets } from '@/composables/useStudentShellWidgets'

const showStudentShellWidgets = useStudentShellWidgets()
</script>

<style scoped lang="scss">
@import '@/styles/layout/_layout-main';
</style>
