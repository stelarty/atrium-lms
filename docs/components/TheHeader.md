# Header

**Header** — уникальный компонент верхней панели приложения в **LMS Атриум**.

Используется для навигации и отображения основных действий интерфейса.  
Компонент существует в единственном экземпляре на странице.

---

## Особенности

- Префикс `The` используется для имени файла компонента
- Стейкируется сверху страницы (`position: sticky`)
- Содержит логотип, навигацию и зоны действий
- Использует глобальный контейнер `.container` из `styles/layout/_container.scss`
- Поддерживает адаптивность через media queries
- Не хранит внутреннее состояние (stateless)

---

## Props

| Название | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `none` | `-` | `-` | Не принимает пропсов |

---

## Emits

| Событие | Аргументы | Описание |
|---------|-----------|----------|
| `none` | `-` | `-` | Не эмитирует события |

---

## Слоты

| Слот | Описание |
|------|----------|
| `logo` | Кастомный логотип (по умолчанию текст "Atrium") |
| `actions` | Правая зона действий (вход, профиль и т.д.) |

> ⚠️ Если слот не указан — используются дефолтные значения компонента.

---

## CSS-классы

```text
header
header__inner
header__nav
header__list
header__item
header__link
header__link--active
header__actions
header__logo
```

---

## Примеры использования

### Базовый

```vue
<template>
  <Header />
</template>
```

### В MainLayout

```vue
<script setup lang="ts">
import Header from '@/components/layouts/Header.vue'
import Sidebar from '@/components/layouts/Sidebar.vue'
</script>

<template>
  <div class="main-layout__topbar">
    <Sidebar />
    <Header />
  </div>
  <!-- Content -->
</template>
```

### С кастомным слотом actions

```vue
<script setup lang="ts">
import Header from '@/components/layouts/Header.vue'
import BaseButton from '@/components/base/BaseButton.vue'
</script>

<template>
  <Header>
    <template #actions>
      <BaseButton variant="secondary">Профиль</BaseButton>
    </template>
  </Header>
</template>
```

---

## Структура лэйаута

```
┌───────────────────────────────────────────────────────────┐
│                         HEADER                            │
│  [Logo] — [Navigation] ──────── [Actions]                 │
└───────────────────────────────────────────────────────────┘
         └────────── Container (max-width: 886px) ──────────┘
```

---

## Зависимости от утилит

| Утилита | Файл |
|---------|------|
| `.container` | `styles/layout/_container.scss` |
| `BaseButton` | `components/base/BaseButton.vue` |
| `screen-min()` mixin | `styles/mixins/_media.scss` |

---

## Архитектурные принципы

- Компонент не содержит бизнес-логики или store
- Не управляет своим состоянием (stateless)
- Все стили scoped, импортируются из отдельного SCSS файла
- Использует семантические теги `<header>`, `<nav>` для доступности
- Соответствует стандартам `workflow.md` §1.2 (префикс `The`)
- Соответствует стандартам `styles.md` §7 (БЭМ нотация)

---

## Возможные расширения

- Поиск / фильтрация в хедере
- Меню уведомлений
- Дропдаун профиля
- Мобильное гамбургер-меню
- Breadcrumb навигация