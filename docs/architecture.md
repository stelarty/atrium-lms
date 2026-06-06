# Архитектура LMS Атриум

## 1. Структура проекта

src/
├── api/                 # Все HTTP-запросы: общий Axios-инстанс (`index.ts`) и доменные модули
├── assets/              # Статические ресурсы
│   ├── icons/           # SVG иконки
│   ├── images/          # Картинки и фотографии
│   └── flags/           # Флаги стран для выбора телефона
├── components/          # UI-компоненты
│   ├── base/            # Маленькие переиспользуемые компоненты (кнопки, инпуты, аватары)
│   ├── layouts/         # Части каркаса страницы (TheHeader, TheFooter)
│   ├── forms/           # Формы (регистрация, авторизация, шаги пошаговых форм)
│   ├── ui/              # ui-примитивы дизайн-системы (иконки, аватары, тултипы)
│   └── widgets/         # Сложные виджеты (карточки курсов, задания, прогресс-бар)
├── composables/         # Переиспользуемые composables для логики, reactive state, watch
├── layouts/             # Оболочки маршрутов (сейчас: MainLayout и др.)
│   └── MainLayout.vue       # Общий layout для защищённых зон student/teacher
├── router/              # Маршруты (Vue Router 4)
├── stores/              # Pinia (`use*Store.ts`, см. [`conventions.md`](./conventions.md))
│   ├── useAuthStore.ts
│   ├── useUserStore.ts
│   ├── useCourseStore.ts
│   ├── useStudentCourseStore.ts
│   └── useCourseWorkersStore.ts
├── styles/              # SCSS
│   ├── base/             # переменные, цвета, шрифты
│   ├── mixins/           # миксины, функции SCSS
│   ├── layout/           # глобальные стили лэйаутов
│   └── components/       # стили компонентов по БЭМ
├── utils/               # Вспомогательные функции (formatter, validator, helper)
└── views/               # Страницы
    ├── student/         # страницы для студентов (Dashboard, Courses, Task)
    ├── teacher/         # страницы для преподавателей (CourseManagement, TaskReview)
    └── common/          # страницы для всех (Home, About, Contact, Login, Register)

---

## 2. Основные слои и ответственность

### 2.1 Components
- **base/** — атомарные UI элементы, переиспользуемые повсеместно
- **layouts/** — части лэйаутов (Header, Footer)
- **forms/** — формы и пошаговые формы (StepForm)
- **widgets/** — сложные элементы с бизнес-логикой (TaskCard, CourseCard, ProgressBar)

### 2.2 Composables
- Реализуют повторяемую логику (fetchData, useFormValidation, useDebounce, usePhone)
- Позволяют вынести реактивность и side-effects из компонентов

### 2.3 Views
- Страницы привязаны к layout
- Используют компоненты и composables
- Отвечают за визуализацию и маршрутизацию

### 2.4 Stores (Pinia)
- Центральное место хранения состояния
- State: данные приложения (пользователь, курсы, задания)
- Actions: методы для изменения состояния и вызовов API
- Getters: вычисляемые данные на основе state

### 2.5 Router
- Маршруты разбиты по ролям: student, teacher, common
- Вложенные маршруты используют layout из `src/layouts/`
- Глобальный `beforeEach`: авторизация, загрузка профиля, проверка `meta.role`, редиректы на `access-denied` / `service-unavailable` (см. `router/index.ts` и [`conventions.md`](./conventions.md))

### 2.6 Styles
- SCSS: глобальные переменные, миксины
- Локальные scoped стили для компонентов
- БЭМ с модификатором через `--`
- Разделение по слоям: base / layout / components

### 2.7 Utils
- Чистые функции: форматирование, валидация, конвертации, хелперы
- Используются в composables, в store и в слое API при подготовке данных

---

## 3. Потоки данных и взаимодействие слоёв

[User Action] → [Component / Widget] → [Composable / Store Action] → [`src/api` functions] → [Store Update] → [Reactive UI]

- Пользователь взаимодействует с компонентом или формой
- Компонент вызывает **composable** или **store action**
- **Доменный модуль `src/api/*.ts`** выполняет HTTP через общий `api` instance
- Store обновляет **state**
- UI автоматически рендерится по реактивности

**Пример:**  
Пользователь сохраняет настройки курса:
1. Форма во view вызывает метод **store** (например `courseStore.save...`)
2. Store вызывает типизированную функцию из **`@/api/courses`** → backend
3. Ответ маппится в state (при необходимости через утилиты из `@/utils`)
4. UI обновляется реактивно