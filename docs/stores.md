# Stores — LMS Атриум

Данный документ описывает **структуру и правила работы с Pinia store** в проекте LMS Атриум.
Цель — чтобы любой разработчик мог создавать store, которые:

* просты для понимания и поддержки,
* логично разделяют бизнес-логику и UI,
* легко тестируются и переиспользуются.

---

## 1. Общие правила

* Один store = один домен (например, userStore, courseStore, taskStore)
* Store **только про бизнес-логику**
* UI-компоненты используют store для данных и действий
* Любой state должен быть реактивным (`ref` или `reactive`)
* Все асинхронные операции (fetch, post) — через store
* Store **не работает с DOM** напрямую

---

## 2. Формат store

Мы используем **Composition API + defineStore**. HTTP выполняется **через функции из `src/api/`**, а не через прямой импорт `axios` внутри store (см. `useCourseStore`, `useAuthStore` и [`conventions.md`](./conventions.md)).

Пример структуры:

```ts
import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import { fetchAdminCourses, getCourseDetails } from '@/api/courses'
import type { LmsCourseResponse } from '@/types/course'

export const useExampleStore = defineStore('example', () => {
  // ===== STATE =====
  const items = ref<LmsCourseResponse[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ===== COMPUTED =====
  const hasItems = computed(() => items.value.length > 0)

  // ===== METHODS =====
  const loadItems = async (): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      items.value = await fetchAdminCourses()
    } catch (err) {
      error.value = 'Ошибка загрузки'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    items,
    isLoading,
    error,
    hasItems,
    loadItems,
  }
})
```

---

## 3. Best Practices

1. **Reactive для объектов**, ref для простых значений (строки, числа, boolean)
2. **Методы асинхронные** — fetch, update, delete
3. **Ошибки храним в отдельном ref `error`**
4. **Loading состояние через `isLoading`**
5. **Минимизируем мутацию объектов** — обновляем только необходимые поля
6. **Store может использовать другие store** для доступа к токенам или глобальному состоянию

---

## 4. Именование

* Файлы store: `use{Domain}Store.ts`, например:

  * `useUserStore.ts`
  * `useCourseStore.ts`
  * `useTaskStore.ts`

* Переменные store внутри компонента:

  ```ts
  const userStore = useUserStore()
  const courseStore = useCourseStore()
  ```

* Состояние: `data`, `isLoading`, `error`, дополнительные реактивные поля

* Методы: `fetchUserData()`, `updateCourse()`, `deleteTask()` — ясно, что делает функция

---

## 5. Асинхронные операции

* Используем **функции из `src/api`**, построенные на общем Axios-инстансе (`api` в `api/index.ts`); токен подставляется interceptor’ом и/или через `addToken` из стора авторизации.
* Обрабатываем ошибки try/catch + `error` state
* Не забываем `finally` для снятия `isLoading`
* Если store зависит от другого, подключаем через `useOtherStore()` внутри метода, избегая циклических импортов на верхнем уровне

---

## 6. Структура папки

```text
src/
├── stores/
│   ├── useAuthStore.ts
│   ├── useUserStore.ts
│   ├── useCourseStore.ts
│   ├── useTaskStore.ts
│   └── useExampleStore.ts
```

* Каждый store отдельным файлом
* Нет смешивания логики разных доменов

---

## 7. Тестирование store

* Каждый store покрываем **unit-тестами**
* Тесты кладем рядом с файлом store:

  ```
  src/stores/useUserStore.spec.ts
  ```
* Моки для axios: не зависеть от реального backend

Пример теста:

```ts
import { describe, it, expect, vi } from 'vitest'
import axios from 'axios'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from './useUserStore'

vi.mock('axios')

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetchUserData заполняет данные', async () => {
    ;(axios.get as any).mockResolvedValue({
      data: { id: '1', email: 'test@test.com', name: 'John', surname: 'Doe' },
    })

    const store = useUserStore()
    await store.fetchUserData()

    expect(store.userData.id).toBe('1')
    expect(store.userData.email).toBe('test@test.com')
  })
})
```

---

## 8. Правила коммита и workflow

* Новые методы/данные store — коммитить вместе с feature веткой
* Перед мерджем в dev — убедиться, что **все store протестированы**
* Следовать git workflow, описанному в [`workflow.md`](./workflow.md) и [`setup.md`](./setup.md)
