# Скелетоны для Онбординга (Идея на Будущее)

## Обзор
Если в будущем потребуется улучшить UX во время загрузки онбординга, можно добавить скелетон вместо пустого экрана. Это даст пользователю визуальную подсказку, что контент загружается.

## Когда Добавлять
- Если тестирование покажет, что пользователи жалуются на "пустой экран" во время загрузки (1-2 секунды).
- Для улучшения восприятия в медленных сетях.
- Не добавлять по умолчанию — KISS-принцип: если работает без скелетона, не усложнять.

## Реализация (Вручную, Без Библиотек)
Не использовать сторонние библиотеки (типа `vue-skeleton-loader`), чтобы избежать увеличения bundle и зависимостей. Реализовать кастомно.

### Шаблон
Добавить в `<template>` перед основным виджетом:
```vue
<div v-if="isLoading" class="widget-onboarding--skeleton">
  <div class="skeleton skeleton--image"></div>
  <div class="skeleton skeleton--title"></div>
  <div class="skeleton skeleton--subtitle"></div>
  <div v-for="n in 3" :key="n" class="skeleton skeleton--line"></div>
</div>
```

### Стили
Добавить в `<style scoped lang="scss">`:
```scss
.widget-onboarding--skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e0e0e0;

  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: pulse 1.5s infinite;
    border-radius: 4px;

    &--image {
      width: 50px;
      height: 50px;
    }

    &--title {
      height: 20px;
      width: 70%;
    }

    &--subtitle {
      height: 16px;
      width: 90%;
    }

    &--line {
      height: 16px;
      width: 100%;
    }
  }
}

@keyframes pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Логика
- `v-if="isLoading"` — показывать скелетон только во время загрузки.
- После загрузки: `v-else-if="isLoaded && shouldShow"` для основного виджета.

## Преимущества
- Быстрая реализация (5-10 строк кода).
- Контроль над анимацией и стилем.
- Не увеличивает bundle значительно.

## Недостатки
- Добавляет DOM-элементы и стили.
- Требует тестирования на производительность.

## Альтернативы
- Если проект вырастет, вынести в отдельный компонент `SkeletonLoader.vue`.
- Использовать CSS-in-JS или scoped slots для переиспользования.