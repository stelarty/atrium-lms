<!-- src/components/base/UiIcon.vue -->
<template>
  <component :is="iconComponent" v-bind="iconProps"  class="ui-icon"/>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, inject } from 'vue'

// Типизация: список всех доступных имён иконок
export type IconName =
  | 'add'
  | 'arrow'
  | 'arrowDropdown'
  | 'autorenew'
  | 'calendar'
  | 'calendarTabBar'
  | 'check'
  | 'clock'
  | 'clockTabBar'
  | 'close'
  | 'contentCopy'
  | 'delete'
  | 'dev'
  | 'doubleArrow'
  | 'dragHandle'
  | 'dragIndicator'
  | 'edit'
  | 'fire'
  | 'fireTabBar'
  | 'folder'
  | 'folderTabBar'
  | 'history'
  | 'info'
  | 'journalTabBar'
  | 'list'
  | 'listTabBar'
  | 'listUl'
  | 'lock'
  | 'logo'
  | 'moreVert'
  | 'new'
  | 'notification'
  | 'person'
  | 'placeholder'
  | 'publish'
  | 'qr'
  | 'question'
  | 'search'
  | 'searchBig'
  | 'settings'
  | 'settingsTabBar'
  | 'teacherList'
  | 'warning'

// Пропсы
interface Props {
  name: IconName
  size?: string | number
  color?: string
  fill?: string
  active?: boolean
  direction?: 'up' | 'down' | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  // size: 24,
  // color: 'currentColor',
  fill: 'none',
  // direction: 'down',
})

// Получаем цвет от BaseIconButton, если передан
const injectedColor = inject<string | undefined>('baseIconColor', undefined)

// Вспомогательная функция для капитализации
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Динамически загружаем иконку как асинхронный компонент
const iconComponent = computed(() => {
  return defineAsyncComponent(
    () => import(`@/assets/icons/Icon${capitalize(props.name)}.vue`),
    // fallback
  )
})

const iconProps = computed(() => ({
  size: props.size,
  color: props.color ?? injectedColor,
  fill: props.fill,
  active: props.active,
  direction: props.direction,
}))
</script>

<style scoped>
.ui-icon {
  display: inline-block;
  vertical-align: middle;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  /* Наследуем цвет, если не задан */
  /* color: v-bind(color); */
}

.ui-icon--up {
  transform: rotate(180deg);
}
.ui-icon--left {
  transform: rotate(90deg);
}
.ui-icon--right {
  transform: rotate(-90deg);
}
/* down — без трансформации */
</style>
