# Components & UI Architecture — LMS Атриум

Данный документ описывает **структуру компонентов**, стандарты именования, ответственность и best practices.  
Цель — чтобы любой разработчик мог быстро понять, где что лежит и как создавать новый компонент.

---

## 1. Структура `components/`

```text
components/
├── base/        # атомарные, переиспользуемые компоненты (кнопки, инпуты, чекбоксы)
├── forms/       # формы регистрации, логина, пошаговые формы
├── layouts/     # элементы лэйаутов (Header, Footer, Sidebar)
├── widgets/     # крупные UI-блоки, содержащие бизнес-логику
└── ui/          # вспомогательные компоненты для специфичных UI-штук (опционально)
```

---

## 1.1 Соглашения из кодовой базы

- **Два уровня layout:** оболочки маршрутов — в `src/layouts/` (`MainLayout.vue`); фрагменты шапки/подвала — в `components/layouts/` (`TheHeader.vue`, `TheFooter.vue`).
- **Alias `@/`** для импортов из `src` вне локальной папки виджета; **относительные пути** — для подкомпонентов в `_feature/` (см. ниже и [`conventions.md`](./conventions.md)).
- **Vite:** в каждый SCSS-фрагмент автоматически подмешивается `@/styles/imports.scss` — не дублируйте ручной импорт базовых переменных/миксинов без необходимости.
- **Props:** `withDefaults(defineProps<...>(), ...)` там, где нужны значения по умолчанию; строгие литеральные union-типы для вариантов UI (`BaseButton`: `variant`, `type`, …).

---

## 2. Типы компонентов и правила использования

### 2.1 Base

* Атомарные, максимально переиспользуемые
* Не знают про store и бизнес-логику
* Получают всё через props и отдают через emits

Примеры:
- `BaseButton.vue`
- `BaseChip.vue`
- `BaseInput.vue`
- `BaseTextarea.vue`
- `BaseCheckbox.vue`
- `BaseModal.vue`

**Anti-patterns**:

* Base-компонент зависит от store или глобальных данных
* Содержит конкретный UI-блок с бизнес-логикой

---

### 2.2 App

* Глобальные инфраструктурные компоненты
* Используются по всему приложению
* Могут работать со store и управлять состоянием приложения

Примеры:
- `AppLoader.vue`
- `AppToast.vue`
- `AppConfirm.vue`
- `AppTaskTimer.vue`

**Anti-patterns**:

* Создание локальных, маленьких компонентов с префиксом `App`

---

### 2.3 The

* Уникальные одиночные компоненты
* Обычно часть layout
* Существуют в единственном экземпляре

Примеры:
- `TheHeader.vue`
- `TheFooter.vue`
- `TheSidebar.vue`
- `TheProfileMenu.vue`

**Anti-patterns**:

* Использовать для повторяемых компонентов
* Превращать в виджеты с логикой

---

### 2.4 Widget

* Крупные самостоятельные UI-блоки
* Содержат бизнес-логику
* Могут использовать store и base-компоненты

Примеры:
- `WidgetCourseCard.vue`
- `WidgetTaskCard.vue`
- `WidgetProgressBar.vue`

**Anti-patterns**:

* Маленькие кнопки или инпуты
* Widget без логики — это Base

### 2.5 ui

└── ui/
    ├── Tooltip.vue
    └── BaseIcon.vue  # универсальный компонент для всех SVG-иконок проекта

**BaseIcon.vue**
- Универсальный компонент для SVG-иконок
- Props:
  - `name` — название иконки
  - `size` — размер (px или rem)
  - `color` — цвет
  - `direction` — направление (для стрелок)
- Используется везде, где нужна иконка
- Отдает чистый UI, не содержит бизнес-логики
- Можно легко добавлять новые иконки через `iconsMap`

---

## 3. Структура файла компонента

```vue
<template>
  <!-- template -->
</template>

<script setup lang="ts">
// 1. imports (store, composables, utils)
// 2. props
// 3. emits
// 4. composables
// 5. state / reactive
// 6. computed
// 7. methods / functions
</script>

<style scoped lang="scss">
/* styles */
</style>
```

**Примечание:** порядок строго соблюдается — улучшает читаемость кода.

---

## 4. Props и Emits

* Все props **строго типизировать**
* Компонент не меняет внешний state напрямую — только через emits

Пример:

```ts
defineProps<{
  task: Task
  disabled?: boolean
}>()

defineEmits<{
  (e: 'answer-changed', value: string): void
}>()
```

---

## 5. Best practices

* **Один компонент = один файл**
* **Компонент = одна ответственность**
* Не смешивать UI и бизнес-логику
* Компоненты **не должны знать о конкретной странице или layout**, если это не `The` или `App`
* **Документировать props и emits** через JSDoc / комментарии
* Использовать composables для переиспользуемой логики
* Scoped стили для всех компонентов, глобальные только там, где действительно нужно

---

## 8. Композитные Widgets и view-секции

Когда Widget или крупная секция страницы становится сложной (>300 строк кода или имеет несколько ответственностей), её нужно разделить на подкомпоненты.

### Структура

```
widgets/
├── WidgetOnboarding.vue             ← Main container component
├── _onboarding/                     ← Подпапка для подкомпонентов (префикс _)
│   ├── OnboardingHeader.vue
│   ├── OnboardingTask.vue
│   ├── OnboardingTasks.vue
│   └── useOnboarding.ts             ← Composable для логики
├── WidgetCourses.vue
├── _courses/
│   ├── CourseCard.vue
│   └── CourseFilter.vue
└── ...
```

Аналогичный подход допустим и для view-специфичных секций:

```
views/teacher/course/_settings/
├── CourseSettingsGeneralTab.vue      ← контейнер секции
└── _general/
    ├── CourseSettingsBasicsSection.vue
    ├── CourseSettingsPaymentSection.vue
    └── CourseSettingsMaterialsSection.vue
```

### Правила

1. **Префикс `_`** указывает на то, что это подпапка с подкомпонентами для widget'а
2. **Main компонент** (`WidgetOnboarding.vue` или `CourseSettingsGeneralTab.vue`) — контейнер (container component)
   - Содержит логику маршрутизации и объединения подкомпонентов
   - Использует composable для состояния
   - Минимум UI логики
3. **Подкомпоненты** — чистые presentational компоненты
   - Получают всё через props
   - Отправляют события через emits
   - Не знают о API или store
4. **Composable** хранится рядом с подкомпонентами
   - Содержит всю логику: API вызовы, вычисления, управление состоянием
   - Экспортирует состояние, computed, методы
   - Назначение: `use<WidgetName>.ts`

### Импорт

```ts
// ✅ Правильно — используются относительные пути
import OnboardingHeader from './_onboarding/OnboardingHeader.vue'
import { useOnboarding } from './_onboarding/useOnboarding'

// ❌ Неправильно — абсолютные пути усложняют рефакторинг
import OnboardingHeader from '@/components/widgets/onboarding/OnboardingHeader.vue'
```

### Пример правильного разделения

#### Main container (`WidgetOnboarding.vue`):
```vue
<template>
  <div v-if="isLoaded && shouldShow" class="widget-onboarding">
    <OnboardingHeader
      :headerImage="headerImage"
      :headerTitle="headerTitle"
      @toggle="toggle"
      @close="handleClose"
    />
    <OnboardingTasks v-show="!collapsed" :tasks="tasks" />
  </div>
</template>

<script setup lang="ts">
import { useOnboarding } from './_onboarding/useOnboarding'
import OnboardingHeader from './_onboarding/OnboardingHeader.vue'
import OnboardingTasks from './_onboarding/OnboardingTasks.vue'

const {
  collapsed,
  isLoaded,
  shouldShow,
  headerImage,
  headerTitle,
  tasks,
  toggle,
  handleClose,
} = useOnboarding()
</script>
```

#### Presentational компонент (`OnboardingHeader.vue`):
```vue
<template>
  <div class="widget-onboarding__header" @click="onToggle">
    <img :src="headerImage" />
    <h3 v-html="headerTitle"></h3>
    <BaseIconButton v-if="showArrow" @click.stop="onToggle">
      <UiIcon name="arrow" />
    </BaseIconButton>
    <BaseIconButton v-if="allCompleted" @click.stop="onClose">
      <UiIcon name="close" />
    </BaseIconButton>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  headerImage: string
  headerTitle: string
  showArrow: boolean
  allCompleted: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'close'): void
}>()

const onToggle = () => emit('toggle')
const onClose = () => emit('close')
</script>
```

#### Composable (`useOnboarding.ts`):
```ts
import { ref, computed, onMounted } from 'vue'
import { fetchOnboarding, updateOnboarding } from '@/api/onboarding'

export function useOnboarding() {
  const collapsed = ref(true)
  const tasks = ref<Task[]>([])
  
  const allCompleted = computed(() => tasks.value.every(t => t.status === 'completed'))
  
  onMounted(async () => {
    const data = await fetchOnboarding()
    buildTasks(data)
  })
  
  const toggle = () => {
    collapsed.value = !collapsed.value
  }
  
  const handleClose = async () => {
    await updateOnboarding({ is_seen: true })
  }
  
  return {
    collapsed,
    tasks,
    allCompleted,
    toggle,
    handleClose,
  }
}
```

### Когда разделять Widget

| Показатель | Действие |
|------------|----------|
| < 200 строк | Оставить как есть (Widget) |
| 200-300 строк | Рассмотреть разделение |
| > 300 строк | **Обязательно разделить** |
| 2+ API вызова | Выделить composable |
| 3+ подсекции UI | Выделить компоненты |

### Стили для подкомпонентов

Стили хранятся **в главном файле** widget'а:

```scss
// _widget-onboarding.scss (один файл для всего widget'а)
.widget-onboarding {
  &__header { }
  &__task { }
  &__tasks { }
}
```

**Почему?**
- Все BEM классы находятся в одном месте
- Легче поддерживать консистентность
-避免 дублирование CSS

---

## 9. Anti-patterns компонентов

* **Файл = Компонент**
  `TaskCard.vue` → `<TaskCard />`

* **Префиксы**:

  * `Base` — атомарные компоненты
  * `App` — глобальные инфраструктурные
  * `The` — уникальные одиночные
  * `Widget` — крупные блоки с логикой

* **Сквозные правила**:

  * Используем PascalCase для компонентов
  * Scoped стили по умолчанию
  * Логика через composables / store, а не внутри компонента

---

## 8. Примеры структуры

components/
├── base/
│   ├── BaseButton.vue
│   └── BaseInput.vue
├── forms/
│   ├── FormLogin.vue
│   └── FormRegister.vue
├── layouts/
│   ├── TheHeader.vue
│   └── TheFooter.vue
├── widgets/
│   ├── WidgetCourseCard.vue
│   └── WidgetTaskCard.vue
└── ui/
    └── Tooltip.vue

* Любой новый компонент добавляется в соответствующую папку
* Если элемент становится сложным — выносится в новый блок/Widget

---

## 9. Стили компонентов

* Для каждого компонента создаётся отдельный SCSS файл в `styles/components/ComponentName.scss`
* В компоненте подключаем его с `@import` и используем `scoped`
* Используем переменные и миксины из `styles/base` и `styles/mixins`
* Не используем глобальные стили для компонента
* Любые повторяемые CSS-хелперы (truncate, flex-center, spacing) берём из миксинов или utils
* Общие правила (colors, z-index, spacing) описываем только в `styles.md` / variables

---

## 10. Документация компонентов

* Для каждого компонента создаётся файл `docs/components/ComponentName.md`
* Там описываем:
  - Назначение компонента
  - Props и emits с типами
  - Варианты стилей (primary, secondary, disabled)
  - Примеры использования и состояний
* Не описываем глобальные стили компонента в `styles.md`, только документацию и ссылки на SCSS
  
