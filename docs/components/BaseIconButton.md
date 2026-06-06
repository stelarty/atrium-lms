# BaseIconButton

**BaseIconButton** — атомарная кнопка-иконка дизайн-системы проекта **LMS Атриум**.

Используется для всех кликабельных иконок интерфейса: закрыть, удалить, редактировать и т.д.  
Компонент является **контролируемым**: состояние `disabled` управляется извне.

---

## Особенности

- Поддерживает несколько **вариантов** (`variant`)
- Поддерживает несколько **типов отображения** (`type`)
- Реализует состояния: `default`, `hover`, `pressed`, `disabled`
- Использует строгую БЭМ-нотацию классов
- Содержимое кнопки задается через **slot**
- Не хранит внутреннее состояние (stateless)

---

## Props

| Название    | Тип                                   | По умолчанию | Описание                                |
|-------------|---------------------------------------|--------------|-----------------------------------------|
| `variant`   | `'primary' \| 'secondary' \| 'error'` | `'primary'`  | Цветовой вариант кнопки                 |
| `type`      | `'contained' \| 'text'`               | `'contained'`| Тип кнопки                              |
| `disabled`  | `boolean`                             | `false`      | Блокирует кнопку                        |
| `ariaLabel` | `string`                              | `'Кнопка'`   | Подпись для доступности (screen reader) |

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
- `text` — прозрачная / текстовая кнопка  

---

## Полиморфность: использование как кнопка, ссылка или роутер-ссылка

`BaseIconButton` — **полиморфный компонент**. Он автоматически определяет, каким элементом быть:

| Пропс       | Тип элемента       | Пример использования |
|-------------|--------------------|------------------------|
| без `to`, `href` | `<button>` | `<BaseIconButton @click="...">` |
| `href`       | `<a href="...">`   | `<BaseIconButton href="https://..." target="_blank">` |
| `to`         | `<RouterLink to="...">` | `<BaseIconButton to="/profile">` |

> 💡 Приоритет: `to` > `href` > `button`.  
> Нельзя использовать одновременно.

---


## CSS-классы

```text
base-icon-button
base-icon-button--{type}
base-icon-button--{variant}
base-icon-button--disabled (опционально)
```

---

## Примеры использования

### Базовый (иконка через slot)

```vue
<BaseIconButton>
  <Icon name="close" />
</BaseIconButton>
```

### С вариантами

```vue
<BaseIconButton variant="primary" type="contained">
  <Icon name="close" />
</BaseIconButton>

<BaseIconButton variant="secondary" type="text">
  <Icon name="settings" />
</BaseIconButton>

<BaseIconButton variant="error" type="contained" :disabled="true">
  <Icon name="trash" />
</BaseIconButton>
```

### Управление состоянием извне

```vue
<script setup lang="ts">

function handleClick() {
    // функционал
}
</script>

<template>
  <BaseIconButton @click="handleClick">
    <Icon name="send" />
  </BaseIconButton>
</template>
```

## Архитектурные принципы

* Компонент не управляет своим состоянием
* Вся логика хранится в родителе
* Компонент остаётся предсказуемым и расширяемым

---

## Возможные расширения

* `loading`
* `tooltip`
* `fullWidth`