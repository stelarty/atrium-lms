# LMS Атриум

**Описание проекта:**
LMS Атриум — образовательная платформа для онлайн-курсов, олимпиад и тестов.
Единый личный кабинет используется как на сайте, так и на платформе.

**Цели проекта:**

* Управление курсами, заданиями и пользователями
* Проведение онлайн-заданий и тестов
* Интеграция с внешним сайтом для покупки курсов
* Масштабируемая архитектура, удобная для команды разработчиков

**Стек технологий:**

* Vue 3 + Composition API
* TypeScript
* Pinia (state management)
* Axios (HTTP-запросы)
* SCSS + БЭМ (стилизация)
* Vite (сборка и dev-сервер)

---

## 🚀 Быстрый старт

Полные инструкции по установке и запуску проекта см. в [`setup.md`](./setup.md).

Коротко:

```bash
# установка зависимостей
npm install

# запуск dev-сервера
npm run dev

# сборка prod
npm run build
```

---

## 📚 Структура проекта

```text
src/
├── api/           # Axios instance и доменные HTTP-функции
├── assets/        # Изображения, иконки, флаги
├── components/    # UI-компоненты (base, ui, forms, widgets, layouts — TheHeader/TheFooter)
├── layouts/       # Оболочки маршрутов (MainLayout)
├── views/         # Страницы
├── router/        # Маршруты и navigation guards
├── stores/        # Pinia stores (`use*Store.ts`)
├── composables/   # Переиспользуемая логика (`use*.ts`)
├── utils/         # Чистые утилиты
├── styles/        # SCSS, БЭМ, переменные, миксины
└── App.vue
```

---

## 📚 Документация

* [`conventions.md`](./conventions.md) — **свод правил по фактическому коду** (API, Pinia, composables, router, импорты); главная опора для code review уровня senior
* [`architecture.md`](./architecture.md) — архитектура проекта
* [`setup.md`](./setup.md) — установка и запуск
* [`workflow.md`](./workflow.md) — правила работы и best practices
* [`components.md`](./components.md) — правила создания и структуры компонентов
* [`composables.md`](./composables.md) — правила создания и структуры composables
* [`stores.md`](./stores.md) — правила работы с Pinia store
* [`api.md`](./api.md) — работа с API
* [`utils.md`](./utils.md) — правила для утилит
* [`changelog.md`](./changelog.md) — история изменений и версий

---

## 🌿 Workflow

Основные моменты:

* Работа в ветке `dev`
* Создание веток для задач: `feature/{название}`, `improvement/{название}`, `fix/{название}`
* Мердж через интерфейс GitLab после успешного теста
* Теги для продакшн-сборки формата `MAJOR.MINOR.PATCH`
  (например, `1.1.0`, `1.1.1`, `1.2.0`)

Подробно — [`workflow.md`](./workflow.md)

---

## 🔖 Changelog

Все изменения фиксируются в [`changelog.md`](./changelog.md) по принципу [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## 🌐 Ссылки

* Сайт: [https://atriumolymp.com/](https://atriumolymp.com/)
* Платформа: [https://potok.atriumolymp.com/](https://potok.atriumolymp.com/)
