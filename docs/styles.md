# Styles & CSS Architecture — LMS Атриум

Данный документ описывает **правила работы со стилями** в проекте LMS Атриум.
Он является **единым источником истины** по CSS/SCSS архитектуре, БЭМ, структуре файлов и общим подходам к стилизации.

Документ обязателен к прочтению перед началом работы с UI.

---

## 1. Философия стилей проекта

Стили в LMS Атриум — это **часть архитектуры продукта**, а не вспомогательный слой.

Мы проектируем CSS так же осознанно, как:

* компоненты
* сторы
* роутинг

### Цели:

* лёгкое возвращение в код через месяцы
* предсказуемые правки без побочных эффектов
* масштабируемость UI
* понятность для новых разработчиков

---

## 2. Технологический стек

* **SCSS** — основной препроцессор
* **Scoped styles** — по умолчанию
* **Классический БЭМ** — обязательный стандарт
* Минимальная зависимость от DOM-структуры
* Использование **mixins** для повторяющихся свойств и адаптивности
* Использование **design tokens** для цветов, отступов, z-index, шрифтов
* **Vite (`vite.config.ts`):** `css.preprocessorOptions.scss.additionalData` подключает `@/styles/imports.scss` ко всем компонентным стилям — глобальные токены и миксины доступны в `lang="scss"` без повторения одной и той же строки `@import` в каждом файле

---

## 3. Архитектура SCSS

```
styles/
├── base/
│   ├── reset.scss            # reset / normalize
│   ├── typography.scss       # базовая типографика
│   ├── variables.scss        # точка входа для всех переменных
│   └── variables/
│       ├── _colors.scss      # палитра и цвета
│       ├── _spacing.scss     # отступы и размеры
│       ├── _text.scss        # шрифты, размеры текста
│       ├── _surface.scss     # фоны, тени, границы
│       └── _z-index.scss     # система z-index
├── mixins/
│   ├── _media.scss           # брейкпоинты / screen-min()
│   ├── _responsive.scss      # responsive-prop() для автоматизации адаптивных свойств
│   ├── _typography.scss      # шрифтовые миксины font(), truncate()
│   └── _helpers.scss         # вспомогательные функции: flex-center, transition, box-shadow, border-radius
├── utilities/
│   ├── _spacing.scss         # utility-классы для отступов
│   ├── _visibility.scss      # utility-классы видимости
│   └── _helpers.scss         # другие утилиты
├── themes/
│   └── _default.scss         # тема по умолчанию
└── index.scss                # единая точка входа для сборки
```

---

## 4. Scoped и глобальные стили

### 4.1 Scoped (по умолчанию)

* Каждый компонент имеет style scoped
* Стили не протекают наружу
* Компонент = замкнутый UI-блок

```scss
<style scoped lang="scss">
.card {}
</style>
```

### 4.2 Глобальные стили (ограниченно)

Допустимы только для:

* reset
* типографики
* CSS-переменных (variables)
* ограниченных utility-классов

❌ Запрещено:

* глобально стилизовать компоненты
* описывать `.button {}` вне компонента

---

## 5. Переменные и дизайн-токены

Все цвета, отступы, размеры, z-index обязаны быть вынесены в `variables/`.
❌ Магические числа запрещены.

Пример:

```scss
// _colors.scss
$color-primary: #4a6cf7;
$color-danger: #ef4444;

// _modular_.scss
$m0: 0px;
$m1: 2px;
$m2: 4px;
$m3: 6px;
$m4: 8px;

// _z-index.scss
$z-header: 100;
$z-dropdown: 150;
$z-modal: 200;
$z-tooltip: 300;
```

---

## 6. Z-index система

```scss
$z-header: 100;
$z-dropdown: 150;
$z-modal: 200;
$z-tooltip: 300;
```

❌ Никаких `z-index: 9999`

---

## 7. БЭМ — стандарт проекта

### 7.1 Синтаксис

* Блок: `block-name`
* Элемент: `block-name__element-name`
* Модификатор: `block-name--modifier-name`
* Модификатор элемента: `block-name__element-name--modifier-name`

```scss
.card {}
.card--active {}

.card__title {}
.card__title--large {}
```

### 7.2 Ограничения

* ❗ Один `__` максимум
* ❗ Один `--` максимум
* ❗ Нет элементов элементов
* ❗ Нет модификаторов без базового класса

### 7.3 Когда элемент становится блоком

Если часть интерфейса:

* переиспользуется
* усложняется
* получает собственную логику

**→ выделяется в отдельный блок**

```scss
.menu {}
.menu__item {}
```

↓

```scss
.menu {}
.menu-item {}
```

---

## 8. Миксины и адаптивность

### 8.1 Брейкпоинты

* `@mixin screen-min($size)` — media queries **mobile-first** (progressive enhancement)
* `@mixin responsive-prop($property, $values)` — автоматическая установка разных значений CSS для mobile/tablet/desktop

Пример использования:

```scss
.card {
  @include responsive-prop(padding, ($m4, $m6, $m8));
  @include responsive-prop(font-size, (14px, 16px, 18px));
}
```

### 8.2 Typography Mixins

* `@mixin font($size, $weight, $line-height, $letter-spacing)` — сокращённый способ установки текста
* `@mixin truncate($lines)` — усечение текста, чтобы не ломать дизайн

```scss
.card__title {
  @include font(16px, 600, 1.4);
  @include truncate(2);
}
```

### 8.3 Helpers

* `@mixin flex-center($direction, $justify, $align)` — центрирование flex-контейнера
* `@mixin transition($properties, $duration, $timing)` — плавные переходы
* `@mixin box-shadow($color, $x, $y, $blur, $spread)` — тень блока
* `@mixin border-radius($radius)` — скругление углов

---

## 9. Scoped компоненты и responsive

* Использовать **mixins для токенизированных свойств** (spacing, font-size, colors) прямо рядом с ними
* Для **больших изменений layout** использовать отдельный `@media` блок внизу компонента

Пример комбинированного подхода:

```scss
.card {
  padding: $m4;
  font-size: 16px;

  @include responsive-prop(padding, ($m4, $m6, $m8));
  @include responsive-prop(font-size, (16px, 18px, 20px));

  .card__title {
    @include font(18px, 600);
    @include truncate(2);
  }
}

/* Если много элементов и layout меняется */
@media (max-width: 640px) {
  .card {
    display: flex;
    flex-direction: column;
    .card__image {
      width: 100%;
    }
  }
}
```

---

## 10. Запрещённые практики

❌ Привязка к DOM:

```scss
.card > div > span {}
```

❌ Стили по тегам:

```scss
button {}
```

❌ Магические числа:

```scss
margin-top: 13px;
```
