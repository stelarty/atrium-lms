# WidgetDropdown

**WidgetDropdown** — раскрывающийся список для выбора одного или нескольких значений.

Используется в формах, фильтрах, сортировке и навигации.

Компонент поддерживает:
- Выбор одного или нескольких значений
- Кастомный триггер через `slot`
- Группировку пунктов
- Иконки (слева и справа)
- Обработку ошибок и пустого состояния

---

## Props

| Название      | Тип                                      | По умолчанию          | Описание            |
|---------------|------------------------------------------|-----------------------|---------------------|
| `modelValue`  | `DropdownItem \| DropdownItem[] \| null` | —                     | Выбранное значение  |
| `groups`      | `DropdownGroup[]`                        | —                     | Группы пунктов      |
| `multiple`    | `boolean`                                | `false`               | Множественный выбор |
| `disabled`    | `boolean`                                | `false`               | Блокировка          |
| `placeholder` | `string`                                 | `'Выберите значения'` | Текст по умолчанию  |
| `error`       | `string \| null`                         | `null`                | Ошибка загрузки     |
| `position`    | `left \| right`                          | `left`                | Выравнивание панели |

---

## Emits

| Событие             | Аргументы | Описание               |
|---------------------|-----------|------------------------|
| `update:modelValue` | value     | Изменение выбора       |
| `retry`             | —         | Повтор загрузки данных |

---

## Slots

### `#trigger` — кастомный триггер

Позволяет заменить стандартный триггер на любой элемент.

| Аргумент | Тип       | Описание                           |
|----------|-----------|------------------------------------|
| `opened` | `boolean` | Текущее состояние: открыто ли меню |

> ⚠️ Если `#trigger` не указан — используется текст: `{{ selectedLabel || placeholder }}`

#### Примеры

```vue
<!-- Простой текст -->
<WidgetDropdown v-model="value" :groups="groups" />

<!-- Кастомный триггер -->
<WidgetDropdown v-model="value" :groups="groups">
  <template #trigger>
    <button>Выбрать предмет →</button>
  </template>
</WidgetDropdown>

<!-- Стрелочка с анимацией -->
<WidgetDropdown v-model="value" :groups="groups">
  <template #trigger="{ opened }">
    <div class="flex items-center gap-2">
      <span>Фильтр</span>
      <UiIcon name="arrow" :direction="opened ? 'up' : 'down'" />
    </div>
  </template>
</WidgetDropdown>
```

---

## Состояния

- default
- hover
- pressed
- chosen
- disabled
- error
- empty

---

## Особенности

- Фиксированная ширина: **225px**
- Высота: **ровно 4 пункта**
- Скролл при превышении
- Поддержка:
  - checkbox
  - иконок:
    - **leftIcon** — слева от текста
    - **rightIcon** — справа (например, индикатор)
  - длинного текста (ellipsis)
  - групп с caption

---

## Пример

```vue
<template>
  <WidgetDropdown
    v-model="dropdownValue"
    :groups="dropdownGroups"
    multiple
    placeholder="Выберите предметы"
  >
    <template #trigger="{ opened }">
      <div class="custom-trigger">
        {{ dropdownValue.length ? 'Выбрано: ' + dropdownValue.length : 'Выберите' }}
        <UiIcon name="arrow" :direction="opened ? 'up' : 'down'" />
      </div>
    </template>
  </WidgetDropdown>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const dropdownValue = ref([])

const dropdownGroups = [
  {
    caption: 'Предметы',
    items: [
      { id: 1, label: 'Математика', leftIcon: 'placeholder' },
      { id: 2, label: 'Русский язык', leftIcon: 'placeholder' },
      { id: 3, label: 'Английский язык', leftIcon: 'placeholder', rightIcon: 'info' },
    ],
  },
]
</script>
```