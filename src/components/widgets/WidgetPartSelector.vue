<template>
  <div class="widget-part-selector">
    <div class="program__header widget-part-selector__row">
      <div class="widget-part-selector__menu">
        <WidgetContextMenu>
          <template #trigger="{ opened }">
            <div class="program__section-title">
              {{ activePart?.title || 'Раздел' }}
              <UiIcon name="arrow" :direction="opened ? 'up' : 'down'" color="#17191F" />
            </div>
          </template>

          <template #menu-items>
            <div class="widget-context-menu--primary">
              <ul class="widget-context-menu__menu-list">
                <li
                  v-for="part in parts"
                  :key="part.id"
                  class="widget-context-menu__menu-item"
                  :class="{
                    'widget-context-menu__menu-item--active': activePart?.id === part.id,
                  }"
                  @click="emit('select', part)"
                >
                  {{ part.title }}
                </li>
              </ul>

              <BaseButton
                v-if="displayMode === 'custom_sections' && userStore.profile?.is_staff"
                variant="primary"
                type="contained"
                class="widget-context-menu__menu-item widget-context-menu__menu-item--action"
                width="full"
                @click="emit('create')"
              >
                Создать новый раздел
              </BaseButton>
            </div>
          </template>
        </WidgetContextMenu>
      </div>

      <div v-if="hasToolbarActionsSlot" class="widget-part-selector__toolbar-actions">
        <slot name="toolbar-actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import WidgetContextMenu from '@/components/widgets/WidgetContextMenu.vue'
import type { LmsCourseDisplayMode } from '@/types/course'
import { useUserStore } from '@/stores/useUserStore'

interface SelectablePart {
  id: number | string
  title: string
}

defineProps<{
  parts: SelectablePart[]
  activePart: SelectablePart | null
  displayMode?: LmsCourseDisplayMode
}>()

const emit = defineEmits<{
  (event: 'select', part: SelectablePart): void
  (event: 'create'): void
}>()

const userStore = useUserStore()
const slots = useSlots()
const hasToolbarActionsSlot = computed(() => Boolean(slots['toolbar-actions']))
</script>

<style scoped lang="scss">
.widget-part-selector__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $m4;
  min-width: 0;
}

.widget-part-selector__menu {
  flex: 1 1 auto;
  min-width: 0;
}

.widget-part-selector__toolbar-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;

  @include screen-min('md') {
    display: none;
  }
}

.program__section-title {
  @include font-titles-subheader;
}
</style>
