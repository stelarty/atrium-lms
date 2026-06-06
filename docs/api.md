# API — LMS Атриум

Данный документ описывает **подход к работе с API** в проекте LMS Атриум.  
Он включает правила создания API-файлов, структуру, обработку ошибок и best practices.

---

## 1. Общие принципы

- Все запросы выполняются через **единый Axios-инстанс `api`**, создаваемый в `src/api/index.ts`.
- Базовый URL задаётся **`VITE_PUBLIC_API_BASE_URL`** без суффикса `/api/` — префикс `/api/` добавляется к `baseURL` инстанса.
- На инстансе настроены **interceptors**: подстановка `Authorization: Token …` из `localStorage`, глобальное логирование ошибок ответа и очистка сессии при **401**.
- Для синхронизации заголовка после логина/логаута используются **`addToken` / `removeToken`** (экспорт из `api/index.ts`).
- Каждый публичный endpoint — **отдельная именованная функция** в доменном файле (`courses.ts`, `profile.ts`, …).
- Все функции **строго типизируются** через TypeScript; избегаем `any`.
- Используем `async/await` для асинхронных вызовов.
- Ошибки в доменном слое: **`console.error` с префиксом** (например `[Courses API]`) и **`throw error`**, если вызывающий код должен решить отображение (store/composable).

Подробности инстанса и политики токенов: [`conventions.md`](./conventions.md).

---

## 2. Структура файлов API

api/
├── index.ts              # инстанс `api`, interceptors, addToken/removeToken, реэкспорты
├── courses.ts            # курсы (админ / LMS)
├── course-parts.ts       # разделы программы
├── course-materials.ts   # материалы курса
├── course-workers.ts     # роли / сотрудники курса
├── student-courses.ts    # курсы ученика
├── lessons.ts            # уроки
├── onboarding.ts         # онбординг
├── profile.ts            # профиль
└── types/                # типы, тесно связанные с контрактом API (профиль, онбординг, …)

* Каждый файл отвечает за **один домен/ресурс**.
* Функции экспортируются **по одной**, без объединения всего в один объект.
* Имя функции отражает действие и ресурс: `fetchAdminCourses`, `createLmsCourse`, `getCourseDetails`.

---

## 3. Общий Axios instance

Реализация в `src/api/index.ts`:

- `axios.create` с `baseURL`, равным базовому хосту плюс суффикс `/api/`, `withCredentials: true`, заголовком `Content-Type: application/json`
- request interceptor: токен из `localStorage` (`accessToken`), заголовок `Authorization: Token …`
- response interceptor: лог `[API Global Error]` и реакция на 401 (очистка токенов)
- экспорт доменных модулей через `export * from './courses'` и т.д.

Используем этот instance для единых настроек и поведения сессии.

```ts
import { api } from './index'

export async function fetchExample(): Promise<Example[]> {
  const response = await api.get('/edspace/manage/example/')
  return response.data
}
```

---

## 4. Примеры вызовов API

### 4.1 Курсы (`courses.ts`)

```ts
import { api } from './index'
import type { LmsCourseCreatePayload, LmsCourseResponse } from '@/types/course'

/**
 * Создать курс LMS.
 * @param payload — данные для создания курса
 * @returns объект созданного курса
 */
export async function createLmsCourse(payload: LmsCourseCreatePayload): Promise<LmsCourseResponse> {
  try {
    const response = await api.post('/edspace/manage/lms-courses/', payload)
    return response.data
  } catch (error) {
    console.error('[Courses API] Ошибка создания курса:', error)
    throw error
  }
}
```

### 4.2 Профиль (`profile.ts`)

Паттерн тот же: `import { api } from './index'`, `try/catch`, префикс в логе, `throw error` (или осознанный fallback, если контракт метода допускает пустой результат).

---

## 5. Best Practices

1. **Одна функция = один endpoint**

   * Не объединяем несколько действий в одной функции.
2. **Типизация**

   * Обязательно использовать интерфейсы / типы TypeScript.
3. **Обработка ошибок**

   * Логируем ошибки и пробрасываем их вверх (`throw error`) для store или компонентов.
4. **Фильтры и query-параметры**

   * Используем `URLSearchParams` для формирования query-string.
5. **Документируем**

   * Каждый endpoint должен иметь комментарий:

   ```ts
   /**
    * Получить список курсов с фильтрацией
    * @param filter объект фильтров
    * @returns массив курсов
    */
   ```

---

## 6. Архитектура типов

```ts
export interface Course {
  id: string
  title: string
  description: string
  // ...
}

export interface CourseDetail extends Course {
  lessons: Lesson[]
  tasks: Task[]
}

export interface Review {
  id: string
  courseId: string
  userId: string
  rating: number
  comment: string
}
```

* Типы доменных сущностей лежат в **`src/types/`** (например `course.ts`, `course-draft.ts`); типы, специфичные для ответов одного модуля, могут жить в **`src/api/types/`** и реэкспортироваться из `api/index.ts` там, где это уже сделано.
* Файлы API импортируют только нужные типы.

---

## 7. Итог

* Разделяем по доменам: файлы в `src/api/*.ts` по ресурсам (см. дерево выше).
* Один инстанс `api` с interceptors, токенами и базовым `/api/`.
* Функции типизированы, ошибки логируются с префиксом домена и при необходимости пробрасываются вверх.
* Query-параметры формируем через `URLSearchParams`, где это уместно.
* Каждый публичный endpoint сопровождаем JSDoc.