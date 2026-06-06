# BaseTab

**BaseTab** — атомарная кнопка таба дизайн-системы проекта LMS Атриум.  
Используется как отдельный элемент внутри навигационного бара.  
Компонент является контролируемым: состояние `active` управляется извне.

---

## Особенности

- Поддерживает отображение иконок слева от текста
- Реализует состояния: `default`, `hover`, `pressed`, `active`, `disabled`
- Использует строгую БЭМ-нотацию классов
- Не хранит внутреннее состояние (stateless)
- Является частью WidgetTabBar виджета
- Поддерживает адаптивность через media queries (`mobile-first`)

---

## Props

| Название   | Тип                    | По умолчанию     | Описание                   |
|------------|------------------------|------------------|----------------------------|
| `id`       | `string \| number`     | `undefined`      | Идентификатор таба         |
| `label`    | `string`               | —                | Текст таба                 |
| `icon`     | `IconName`             | `undefined`      | Иконка слева от текста     |
| `active`   | `boolean`              | `false`          | Активное состояние таба    |
| `disabled` | `boolean`              | `false`          | Блокирует взаимодействие   |

> ⚠️ Если `disabled === true`, событие `select` не генерируется.

---

## Emits

| Событие | Аргументы | Описание                    |
|---------|-----------|-----------------------------|
| `select`| `id?`     | Вызывается при клике на таб |

---

## Состояния

- **default** — обычное состояние
- **hover** — при наведении (фон `$surface-default-colored-surface-additional`)
- **pressed** — при нажатии (через `:active` псевдокласс)
- **active** — активный таб (цвет фона `$surface-default-colored-surface-additional`, текст `$text-default-primary`, иконка `$surface-default-accent`)
- **disabled** — таб заблокирован (opacity `0.5`, cursor `not-allowed`)

---

## Цвета состояний

| Состояние | Фон                                           | Текст                     | Иконка                    |
|-----------|-----------------------------------------------|---------------------------|---------------------------|
| default   | прозрачный                                    | `$text-default-secondary` | `currentColor`            |
| hover     | `$surface-default-colored-surface-additional` | `$text-default-primary`   | `currentColor`            |
| active    | `$surface-default-colored-surface-additional` | `$text-default-primary`   | `$surface-default-accent` |
| disabled  | прозрачный                                    | `$text-disabled-primary`  | `transparent` / disabled  |

---

## Aдаптивность

| Экран                    | Иконка                      | Расположение                           | Шрифт текста         |
|--------------------------|-----------------------------|----------------------------------------|----------------------|
| Mobile (< 768px)         | скрыта (`display: none`)    | горизонтально (`flex-direction: row`)  | `$font-body-caption` |
| Tablet/Desktop (≥ 768px) | показана (`display: block`) | горизонтально (`flex-direction: row`)  | `$font-body-caption` |
| Desktop (≥ 1024px)       | показана                    | вертикально (`flex-direction: column`) | `$font-body-text`    |

> ℹ️ Иконка скрывается на мобильных для экономии места. На десктопе переключается с горизонтального на вертикальный лейаут.

---

## CSS-классы

```text
base-tab
base-tab--active
base-tab--disabled
base-tab__label
.ui-icon (вложенный компонент UiIcon)
```

---

## Примеры использования

### Базовый

```vue
<BaseTab label="Программа" />
```

### С иконкой и активным состоянием

```vue
<BaseTab 
  id="program" 
  label="Программа" 
  icon="list" 
  active 
>
</BaseTab>
```

### В составе WidgetTabBar

```vue
<template>
  <WidgetTabBar v-model="activeTab" :items="tabs" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WidgetTabBar from '@/components/widgets/WidgetTabBar.vue'
import type { IconName } from '@/components/ui/UiIcon.vue'

const activeTab = ref({ id: 1, label: 'Программа', icon: 'list' as IconName })
const tabs = [
  { id: 1, label: 'Программа', icon: 'list' },
  { id: 2, label: 'Расписание', icon: 'calendar' },
  { id: 3, label: 'Прогресс', icon: 'fire' },
]
</script>
```

### Управление состоянием извне

```vue
<script setup lang="ts">
import { ref } from 'vue'
import BaseTab from '@/components/base/BaseTab.vue'

const isActive = ref(false)

function handleClick() {
  isActive.value = !isActive.value
}
</script>

<template>
  <BaseTab 
    :id="1"
    :label="'Активный таб'"
    :active="isActive"
    @select="handleClick"
  />
</template>
```

### Блокировка взаимодействия

```vue
<BaseTab 
  id="locked-tab" 
  label="Заблокировано" 
  disabled 
>
</BaseTab>
```

---

## Архитектурные принципы

- Компонент не управляет своим состоянием
- Вся логика хранится в родителе (`WidgetTabBar` или родительский View)
- Использует `provide('baseIconColor', 'currentColor')` для передачи цвета в `UiIcon`
- Все стили `scoped`, импортируются из отдельного SCSS файла
- Соответствует стандартам `workflow.md` §1.2 (префикс `Base`)
- Адаптивность реализована через mixins из `styles/mixins/_media.scss`

---

## Зависимости от утилит

| Утилита       | Файл                                                       |
|---------------|------------------------------------------------------------|
| `UiIcon`      | `components/ui/UiIcon.vue`                                 |
| Design tokens | `styles/base/variables/`                                   |
| Mixins        | `styles/mixins/_media.scss`, `styles/mixins/_helpers.scss` |

---

## Возможные расширения

- `loading` (индикатор загрузки)
- `badge` (бэдж с уведомлением)
- `tooltip` (подсказка при наведении)