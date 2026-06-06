# Соглашения по коду — LMS Атриум

Документ фиксирует **паттерны, которые уже приняты в репозитории** и которые стоит повторять в новом коде. Это не абстрактный гайд: при расхождении между «как написано в старом документе» и **фактической реализацией** приоритет у кода; этот файл сводит реализацию к явным правилам уровня production.

Связанные материалы: [`workflow.md`](./workflow.md), [`components.md`](./components.md), [`composables.md`](./composables.md), [`stores.md`](./stores.md), [`api.md`](./api.md), [`utils.md`](./utils.md), [`styles.md`](./styles.md).

---

## 1. Стек и инфраструктура

- **Vue 3**, SFC, **`<script setup lang="ts">`**, Composition API.
- **Pinia** через `createPinia()` в `main.ts`.
- **Vue Router 4**, `createWebHistory(import.meta.env.BASE_URL)`.
- **Alias `@`** → каталог `src/` (см. `vite.config.ts`).
- **SCSS:** в `vite.config.ts` задано `additionalData: @import "@/styles/imports.scss";` — переменные и миксины из `imports.scss` доступны в любом `<style lang="scss">` без ручного импорта в каждом файле. В компонентах по-прежнему используем **`scoped`**, а специфичные для страницы/виджета блоки подключаем отдельным файлом из `styles/pages/` или `styles/components/` через `@import`, как в существующих вью и виджетах.

---

## 2. Точка входа и старт приложения

Файл `src/main.ts`:

- Подключает глобальные стили **один раз**: `@/styles/globals.scss`.
- Создаёт приложение: `createApp(App).use(createPinia()).use(router).mount('#app')`.
- После `mount` выполняется **инициализация сторов**: вызываются `useAuthStore()`, `useUserStore()`, `useCourseStore()`, `useStudentCourseStore()`; при уже авторизованном пользователе — загрузка профиля и списка курсов (ветвление по `profile.is_staff`).
- Используется **top-level `await`** (модуль в async-контексте), что допустимо в Vite для стартовой загрузки.

Слушатель `window` `storage` по ключу `isAuthenticated` — согласованное поведение для синхронизации сессии между вкладками (перезагрузка при изменении).

`App.vue` минимален: `RouterView` и повторный вызов `initializeAuth` в `onMounted` как страховка для клиентской гидрации сессии.

**Правило:** тяжёлую стартовую оркестрацию держим в `main.ts` и в guard’ах роутера, а не в произвольных компонентах.

---

## 3. Слой API (`src/api/`)

### 3.1 Общий клиент (`api/index.ts`)

- Базовый URL **без** суффикса `/api/`: `VITE_PUBLIC_API_BASE_URL` или fallback-хост.
- Инстанс Axios: поле `baseURL` собирается как `BASE_URL` + `'/api/'` (см. `src/api/index.ts`), `withCredentials: true`, JSON-заголовки.
- **Request interceptor:** подставляет `Authorization: Token <accessToken>` из `localStorage`, если заголовок ещё не задан.
- **Response interceptor:** логирует ошибку в виде объекта (`status`, `message`, `url`); при **401** очищает токены в `localStorage` (глобальная политика сессии).
- Экспортируются хелперы **`addToken` / `removeToken`** для синхронизации дефолтных заголовков инстанса со стором авторизации.

### 3.2 Доменные модули

- Один файл — **один домен** (`courses.ts`, `course-parts.ts`, `profile.ts`, …).
- Импорт **`import { api } from './index'`**, вызовы через `api.get` / `api.post` и т.д.
- Каждая публичная функция = **один запрос** (или один смысловой round-trip), возвращает **типизированный** `Promise<...>`.
- Ошибки: `console.error` с **префиксом домена** (например `[Courses API] ...`), затем **`throw error`** — вызывающий слой (store или composable) решает, как отразить ошибку в UI.
- JSDoc над функцией: назначение, параметры, возвращаемое значение.

### 3.3 Баррель (`api/index.ts`)

Реэкспорт доменных функций и типов (`export * from './courses'` и т.д.) упрощает импорты вида `import { addToken } from '@/api'` там, где уместно.

---

## 4. Pinia stores (`src/stores/use*Store.ts`)

### 4.1 Форма store

- **`defineStore('id', () => { ... })`** с setup-функцией, реактивность из **`ref` / `reactive` / `computed`**.
- Крупные store размечают секции комментариями: `// ===== STATE =====`, `// ===== COMPUTED =====`, `// ===== METHODS =====` — так сделано, например, в `useCourseStore`.

### 4.2 Сеть и данные

- **HTTP только через функции из `@/api/...`**, не через «сырой» `axios` внутри store (как в `useCourseStore`).
- Типы моделей — из **`@/types/...`**.
- **Чистые преобразования** (валидация черновика, сбор payload, форматирование дат) — из **`@/utils/...`**, store остаётся оркестратором.

### 4.3 Состояние загрузки и ошибок

- Паттерны: `isLoading`, `isSaving`, `error: ref<string | null>(null)`, при необходимости `isCoursesLoaded`.
- Асинхронные методы: `try/finally` с сбросом флагов загрузки; ошибки логировать и выставлять `error.value` там, где это принято в конкретном store.

### 4.4 Связь между сторами

- Вызов другого store из action допустим (`useUserStore` из `useAuthStore` при `setToken` / `logout`) — избегаем только циклических зависимостей на уровне модулей.

### 4.5 Именование файлов

- Файл: **`useCourseStore.ts`**, экспорт **`useCourseStore`**. Имя файла совпадает с именем composable-функции store.

---

## 5. Composables (`src/composables/use*.ts`)

### 5.1 Экспорт и именование

- Публичный composable: **`export function useTeacherProgramParts()`** (имя файла **`useTeacherProgramParts.ts`** в camelCase с префиксом `use`).
- Допустим и стиль **`export const useBreakpoints = () => { ... }`** для очень маленьких хуков — оба варианта есть в коде; для новых доменных composable предпочтительна **именованная функция** `export function use...` — проще искать и дебажить в стеке.

### 5.2 Структура файла

- **Вспомогательные чистые функции** и константы, не требующие инстанса composable, размещают **над** `export function use...` (пример: `buildApiErrorMessage`, `createSuggestedPartTitle` в `useTeacherProgramParts`; табы и опции — вне `useTeacherCourseSettings`).
- Внутри composable: импорты → вызовы других store → `ref`/`computed` → методы → `watch`/`onMounted` при необходимости → **`return` только используемое API**.

### 5.3 Ошибки API в composable

- Разбор тела ошибки Axios (например `response?.data?.detail`, `title`) выносится в маленький хелпер с **`error: unknown`** и сужением типа, без расползания `any`.
- Для UX часть composable возвращает **строку ошибки пользователю** или `null` при успехе (`Promise<string | null>`), а не только бросает исключение — паттерн из работы с разделами курса.

### 5.4 Побочные эффекты

- **Нет** автоматических запросов при импорте модуля.
- Подписки на `window` (resize и т.д.) оформляются в **`onMounted` / `onUnmounted`** внутри composable (`useBreakpoints`).

### 5.5 Импорты

- Store и API: **`@/stores/...`**, **`@/api/...`**, типы **`@/types/...`**.
- Типы, экспортируемые из SFC (например `BaseSelectOption` из `BaseSelect.vue`), импортируются по **`@/components/...`** когда composable задаёт доменные списки опций.

---

## 6. Компоненты Vue

### 6.1 Разделение по папкам (фактическая структура)

- `components/base/` — дизайн-система, без бизнес-логики.
- `components/widgets/` — составные блоки сценариев.
- `components/layouts/` — **части** каркаса (`TheHeader`, `TheFooter`).
- `layouts/` в корне `src/` — **оболочки маршрутов** (`MainLayout.vue` и др.).

### 6.2 Props и emits

- **`defineProps` с дженериком** или **`withDefaults(defineProps<{ ... }>(), { ... })`** для значений по умолчанию (`BaseButton`).
- **`defineEmits<{ (e: 'click', event: MouseEvent): void }>()`** — строго типизированные события.

### 6.3 Шаблон и стили

- Классы в шаблоне собираются в **БЭМ-нейминг** (`base-button`, `base-button--primary`, модификаторы через объекты при необходимости).
- Стили страницы: **`@import '@/styles/pages/_course_view';`** в `<style scoped lang="scss">` — не раздуваем SFC гигабайтами CSS.

### 6.4 Связь с дочерними примитивами

- Использование **`provide`** из base-компонента для поддерева (пример: цвет иконки для `UiIcon` внутри `BaseButton`) — допустимый паттерн для инкапсуляции дизайна.

---

## 7. Router

- Маршруты объявляются **плоским списком** с комментариями-секциями (`// ========== TEACHER ROUTES ==========`).
- **Ленивая загрузка**: `component: () => import('@/views/...')`.
- **meta:** как минимум `requiresAuth`, `role: 'student' | 'teacher'` для защищённых веток.
- **`router.beforeEach(async (to) => { ... })`**:
  - ленивая `initializeAuth` при наличии токена в `localStorage`;
  - для `/student` — `await userStore.fetchProfileData()`, при ошибке навигация на **`/service-unavailable`**;
  - проверка роли через `userStore.profile.is_staff` vs `meta.role`;
  - защита от петель редиректа при уже корректном пути (`/teacher`, `/teacher/course/...`).

**Правило:** не дублировать те же проверки в каждом view без необходимости — опираться на guard и мета-поля.

---

## 8. Утилиты (`src/utils/`)

- **Чистые функции**, один вход → один предсказуемый результат, без обращения к store и без запросов.
- Доменные мапперы и валидация форм курса сосредоточены, например, в **`course-settings.ts`**, и импортируются в store.
- Типы только из `@/types/...`, без циклов с Vue-файлами.

---

## 9. Импорты: `@/` и относительные пути

- **`@/...`** — для всего, что лежит в общих слоях (`api`, `stores`, `components`, `types`, `utils`, `views` из другого модуля).
- **Относительные пути `./_feature/...`** — для **локальной иерархии** виджета или секции view (подкомпоненты и `use*.ts` рядом), как описано в `components.md` и реализовано в `_onboarding/`, `_settings/` и т.д.

---

## 10. Логирование и сообщения об ошибках

- Префиксы в логах: **`[Courses API]`**, **`[API Global Error]`**, **`[CourseView]`** в `console.error` — облегчают фильтрацию в консоли.
- В composable допустим префикс **`[Composable]`** или доменный, если так принято в файле.

---

## 11. Документация фич

- Новый переиспользуемый **base/widget** — по возможности **`docs/components/ComponentName.md`**.
- Крупное изменение поведения — строка в **`changelog.md`** по договорённости команды.

---

## 12. Чеклист перед мерджем (практический)

1. Нет ли прямого `axios` вне `src/api/`?
2. Нет ли «магических» строк URL в компонентах вместо функций API?
3. Store не трогает DOM и не хранит ref на компонент?
4. Composable не делает сетевых вызовов при импорте?
5. Типы публичных функций и props/emits заданы явно?
6. Стили: БЭМ, токены из SCSS, без произвольного `z-index: 9999`?
7. Для teacher/student маршрутов учтены guard’ы и `meta.role`?

Если все пункты выполнены — изменения соответствуют принятым в репозитории стандартам качества.
