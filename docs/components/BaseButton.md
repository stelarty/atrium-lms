# BaseButton

**BaseButton** — атомарная кнопка дизайн-системы проекта **LMS Атриум**.

Используется для всех кликабельных действий интерфейса.  
Компонент является **контролируемым**: состояние `disabled` управляется извне.

---

## Особенности

- Поддерживает несколько **вариантов** (`variant`)
- Поддерживает несколько **типов отображения** (`type`)
- Реализует состояния: `default`, `hover`, `pressed`, `disabled`
- Использует строгую БЭМ-нотацию классов
- Не хранит внутреннее состояние (stateless)

---

## Props

| Название   | Тип                                   | По умолчанию | Описание                |
|------------|---------------------------------------|--------------|-------------------------|
| `variant`  | `'primary' \| 'secondary' \| 'error'` | `'primary'`  | Цветовой вариант кнопки |
| `type`     | `'contained' \| 'text'`               | `'contained'`| Тип кнопки              |
| `disabled` | `boolean`                             | `false`      | Блокирует кнопку        |

---

## Emits

| Событие | Аргументы    | Описание |
|-------|-------------|----------|
| `click` | `MouseEvent` | Клик по кнопке |

> ⚠️ Если `disabled === true`, событие `click` не генерируется.

---

## Состояния

- **default** — обычное состояние  
- **hover** — при наведении  
- **pressed** — при нажатии  
- **disabled** — кнопка заблокирована  

---

## Варианты (`variant`)

- `primary` — основное действие  
- `secondary` — вторичное действие  
- `error` — опасное / негативное действие  

---

## Типы (`type`)

- `contained` — кнопка с заливкой  
- `text` — текстовая кнопка  

---

## Полиморфность: использование как кнопка, ссылка или роутер-ссылка

`BaseButton` — полиморфный компонент. Он автоматически определяет, каким элементом быть:

| Пропс            | Тип элемента           | Пример                                                                     |
|------------------|------------------------|----------------------------------------------------------------------------|
| без `to`, `href` | `<button>`             | `<BaseButton @click="save">Сохранить</BaseButton>`                         |
| `href`           | `<a href="...">`       | `<BaseButton href="https://example.com" target="_blank">Сайт</BaseButton>` |
| `to`             | `<RouterLink to="...">`| `<BaseButton to="/profile">Профиль</BaseButton>`                           |

> ⚠️ Приоритет: `to` > `href` > `button`. Нельзя использовать одновременно.

---

## CSS-классы

```text
base-button
base-button--{type}
base-button--{variant}
base-button--disabled (опционально)
```

---

## Примеры использования

### Базовый

```vue
<BaseButton>Сохранить</BaseButton>
```

### С вариантами

```vue
<BaseButton variant="primary" type="text" @click="doSomething">Сохранить</BaseButton>
<BaseButton variant="secondary">Отмена</BaseButton>
<BaseButton variant="error" :disabled="true">Удалить</BaseButton>
```

### Управление состоянием извне

```vue
<script setup lang="ts">

function handleClick() {
    // функционал
}
</script>

<template>
  <BaseButton :disabled="isDisabled" @click="handleClick">
    Отправить
  </BaseButton>
</template>
```

---

## Архитектурные принципы

- Компонент не управляет своим состоянием
- Вся логика хранится в родителе
- Компонент остаётся предсказуемым и расширяемым

---

## Возможные расширения

- `loading`
- `size`
- `icon`
- `fullWidth`