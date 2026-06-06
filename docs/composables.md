# Composables — LMS Атриум

Правила разработки composable-функций, согласованные с **фактическим кодом** в `src/composables/`.  
Расширенный свод (импорты, ошибки API, старт приложения): [`conventions.md`](./conventions.md).

---

## 🔷 **1. Назначение и сфера ответственности**

| Правило | Почему это важно |
|---------|------------------|
| **Выносите логику, которая может быть переиспользована в нескольких компонентах.** | Если функция используется более чем в одном месте — это composable |
| **Не храните UI-состояние внутри composable (кроме исключений).** | UI принадлежит View/Component, а не business logic |
| **Композаблы должны быть чистыми функциями без побочных эффектов при импорте.** | Позволяет легко тестировать и избежать скрытых зависимостей |
| **Композабл должен возвращать только то, что реально нужно для конкретной задачи.** | Не усложняйте интерфейс — минимизируйте экспортируемые данные |

---

## 🔷 **2. Именование файлов и функций**

```typescript
// ✅ Правильно (имя файла = имя функции)
useBreakpoints.ts        → export const useBreakpoints = () => { ... }
useTeacherProgramParts.ts → export function useTeacherProgramParts() { ... }

// ❌ Неправильно
breakpoints.ts
teacher-program-parts.ts
UseTeacherProgramParts.ts
```

| Требование | Пример |
|------------|--------|
| Файлы называются в **camelCase** с префиксом `use` | `useFormValidation.ts` |
| Импорт: `import { useForm } from '@/composables/useForm'` | именованный экспорт |
| Название функции: **`use` + PascalCase остатка** в имени файла | `useTeacherProgramParts` в `useTeacherProgramParts.ts` |

---

## 🔷 **3. Структура файла Composable**

```typescript
// src/composables/useName.ts
import { ref, computed, onMounted, watch } from 'vue'
import { useSomeStore } from '@/stores/useSomeStore'
import type { SomeType } from '@/types/some-type'

/**
 * @description Краткое описание назначения композабла
 * @returns Объект с реактивными переменными, методами и вычисляемыми свойствами
 */
export function useName() {
  // ===== 1. State =====
  const state = ref<Type>(initialValue)

  // ===== 2. Computed =====
  const computedProp = computed(() => state.value)

  // ===== 3. Methods =====
  const methodName = async (): Promise<Result> => {}

  // ===== 4. Watches & Lifecycle =====
  watch(/*...*/)
  onMounted(/*...*/)

  // ===== 5. Return =====
  return {
    state,
    computedProp,
    methodName,
  }
}
```

### Паттерны из репозитория

- **Вспомогательные функции над composable:** чистые хелперы (`buildApiErrorMessage`, генерация заголовков) и неизменяемые конфиги (списки вкладок, опции селектов) держим **выше** `export function use...`, чтобы тело composable читалось как сценарий.
- **Ошибки домена:** узкий разбор `unknown` (ответ Axios) и возврат **строки для UI** или `null` — практичный паттерн для форм и списков без глобальных toast на каждый шаг.
- **Подписки на `window`:** только внутри `onMounted` / `onUnmounted` composable, не на верхнем уровне модуля.

---

## 🔷 **4. Работа со сторами (Pinia)**

```typescript
// ✅ Правильно
const someStore = useSomeStore()
someStore.fetchData()

// ❌ Неправильно
import useSomeStore from '@/stores/useSomeStore'

// В глобальной области (при загрузке модуля)
if (!someStore.initialized) {
  await someStore.initialize() // ← Побочный эффект при импорте
}
```

### **Правила:**

| Правило | Описание |
|---------|----------|
| Хранить локальные данные в store, а не в composable | Используйте Pinia как единый источник данных |
| Мутация данных только через methods store | `store.setData()` → `store.data = value` ❌ |
| Нельзя вызывать store actions при импорте composable | Создавайте методы для вызова вручную |
| Можно использовать несколько сторов одновременно | Но не создавайте циклические зависимости |

---

## 🔷 **5. Работа с API и сервисиыми слоями**

```typescript
// ✅ Правильно
import { fetchProfile } from '@/api/profile'

const fetchUserProfile = async () => {
  try {
    const data = await fetchProfile()
    // Логика обработки данных
    return data
  } catch (error) {
    console.error('[Composable] Ошибка:', error)
    throw error
  }
}

// ❌ Неправильно
axios.get('/api/profile/') // ← Прямой вызов API
```

### **Требования:**

1.  **Использовать функции из `src/api/`** вместо прямых вызовов `axios` вне слоя API
2.  **Логировать ошибки** перед бросанием вверх
3.  **Обрабатывать ошибки в UI слое**, если необходимо кастомное поведение
4.  **Типизировать все ответы API** (`Promise<T>`)

---

## 🔷 **6. Реактивность и обновления состояния**

```typescript
// ✅ Правильно
const reactiveState = ref(Type)
const reactiveArray = reactive([])

// ❌ Неправильно
let variable = null // ← Обычная переменная без реактивности
state.variable = '' // ← Изменение properties реф без .value
```

### **Важные правила:**

| Правило | Описание |
|---------|----------|
| Использовать `ref` для примитивных типов (строки, числа, булевы) | `name.value = 'new'` |
| Использовать `reactive` для объектов с множеством полей | `Object.assign(state, newValues)` |
| Не мутировать массивы напрямую (`push`, `pop`) | Использовать `array.value.push(item)` или создавать новые массивы |
| Использовать `.value` только внутри скрипта setup | Внутри `<template>` автоматически раскрывается |

---

## 🔷 **7. Обработка ошибок и логирование**

```typescript
// ✅ Правильно
try {
  await someAction()
} catch (error: any) {
  console.error('[Composable] Ошибка выполнения action:', error.message)
  handleError(error) // ← Вызов метода обработки ошибок
  return false
}

// ❌ Неправильно
catch (error) {
  console.log(error) // ← Слишком общий лог
  throw new Error('Ошибка') // ← Бросаем новое сообщение с потерей контекста
}
```

### **Стандарты логирования:**

1.  **Префикс [Composable]** для быстрого поиска в консоли
2.  **Сохранять оригинальную ошибку** (`error.message` или `error.response`)
3.  **Обрабатывать специфические ошибки** (401, 403, Network Error)
4.  **Не игнорировать ошибки** — всегда выбрасывать или обрабатывать

---

## 🔷 **8. Типизация и TypeScript**

```typescript
// ✅ Правильно
interface ResultType {
  id: number
  name: string
}

export function useName(): {
  result: Ref<ResultType | null>
  setResult: (data: ResultType) => void
}

// ❌ Неправильно
function useAny() {
  return { data: any } // ← Использование any недопустимо
  return { data: null } // ← Без явной типизации
}
```

### **Требования к типизации:**

1.  **Все интерфейсы и типы, относящиеся к домену, выносить в `src/types/`** (или локальный `type`/`interface` в composable, если тип используется только здесь)
2.  **Избегать `any`** — использовать строгие интерфейсы
3.  **Типизировать все аргументы и возвращаемые значения**
4.  **Использовать `Ref<T>` для реактивных значений**

---

## 🔷 **9. Производительность и оптимизация**

```typescript
// ✅ Правильно
const heavyData = ref<Data[]>([])
onMounted(async () => {
  heavyData.value = await fetchData()
})

// ❌ Неправильно
const heavyData = computed(() => expensiveCalculation()) // ← Запускается каждый ререндер
watch(source, () => { expensiveWork() }) // ← Нет debouncing
```

### **Оптимизация:**

| Метод | Зачем нужен |
|-------|-------------|
| **`computed()`** для тяжелых вычислений | Пересчитывается только при изменении зависимостей |
| **`debounce()`** для частых событий | Избегаем лишних ререндеров |
| **`v-show` вместо `v-if`** | Сохраняем DOM элементы в памяти |
| **Отложенная загрузка компонентов** | Уменьшаем время первоначального рендера |

---

## 🔷 **10. Тестирование и документация**

```markdown
### docs/composables/useName.md

#### Назначение
Описывает задачу и сценарии использования

#### Параметры
- none (или props параметры)

#### Возвращаемые значения
- `result: Ref<ResultType | null>` — текущее значение
- `setResult: (data: ResultType) => void` — метод установки

#### Пример использования
```typescript
import { useName } from '@/composables/useName'

const { result, setResult } = useName()
```

#### Сторы и зависимости
Зависит от `useUserStore` и API метода `fetchProfile`

---

## 🔷 **11. Антипаттерны, которые я НИКОГДА не допущу**

| Антипаттерн | Почему это ошибка | Как исправить |
|-------------|-------------------|---------------|
| **Использование побочных эффектов при импорте** | Скрытые зависимость, сложно тестировать | Вызывать методы явно из UI |
| **Хранение UI-состояния в composable** | Нарушение границ ответственности | Хранить в Store или Props |
| **Прямой вызов API из composable без error handling** | Теряется контекст ошибки | Оборачивать в try/catch |
| **Возврат слишком многого** | Переусложнение кода | Возвращать только нужное |
| **Игнорирование типов TypeScript** | Снижение безопасности кода | Строгая типизация всех операций |
| **Нет документации** | Другой разработчик не поймет использование | Писать `.md` для каждого composable |
| **Скрытая мутация внешнего состояния** | Нарушает принцип одностороннего потока данных | Использовать методы store/actions |
| **Необработанные ошибки** | Приложение падает без сообщения | Всегда ловить и обрабатывать ошибки |

---

## 🔷 **12. Практические примеры реализации**

### **Пример 1: Простой composable для форм**

```typescript
// src/composables/useForm.ts
import { ref, computed, reactive } from 'vue'
import type { FormErrors } from '@/types/form'

export interface UseFormOptions {
  initialValues: Record<string, any>
  validators?: Record<string, (value: any) => string | undefined>
}

export function useForm(options: UseFormOptions) {
  const form = reactive({ ...options.initialValues })
  const errors = reactive<FormErrors>({})
  const isDirty = ref(false)
  const isValid = computed(() => Object.keys(errors).length === 0)

  const updateField = (field: string, value: any): void => {
    form[field] = value
    isDirty.value = true
    
    // Проверка валидации
    if (options.validators?.[field]) {
      const error = options.validators[field](value)
      if (error) errors[field] = error
      else delete errors[field]
    }
  }

  const reset = (): void => {
    Object.assign(form, options.initialValues)
    Object.assign(errors, {})
    isDirty.value = false
  }

  return {
    form,
    errors,
    isDirty,
    isValid,
    updateField,
    reset,
  }
}
```

---

### **Пример 2: Composable с интеграцией API**

```typescript
// src/composables/useCourseParts.ts
import { ref, computed } from 'vue'
import { useCourseStore } from '@/stores/useCourseStore'
import { createCoursePart, updateCoursePart } from '@/api/course-parts'
import type { LmsCoursePart } from '@/types/course'

export function useCourseParts(courseId: number) {
  const courseStore = useCourseStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const parts = computed(() => {
    const course = courseStore.createdCourse
    return course?.parts || []
  })

  const addPart = async (title: string): Promise<LmsCoursePart | null> => {
    isLoading.value = true
    try {
      const part = await createCoursePart({ course: courseId, title })
      // Обновление через store (не через mutation)
      await courseStore.loadCourseById(String(courseId))
      return part
    } catch (e: any) {
      error.value = e?.response?.data?.detail || 'Ошибка создания раздела'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updatePart = async (id: number, title: string): Promise<boolean> => {
    isLoading.value = true
    try {
      await updateCoursePart(id, { title })
      await courseStore.loadCourseById(String(courseId))
      return true
    } catch (e: any) {
      error.value = e?.response?.data?.detail || 'Ошибка обновления'
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    parts,
    isLoading,
    error,
    addPart,
    updatePart,
  }
}
```

---

## 🔷 **Чеклист при создании Composable**

Перед тем как создать новый комposable, проверь:

1.  **[ ]** Можно ли эту логику переиспользовать?
2.  **[ ]** Все ли типы заданы?
3.  **[ ]** Есть ли обработка ошибок?
4.  **[ ]** Нет ли побочных эффектов при импорте?
5.  **[ ]** Вынесены ли все API вызовы в отдельные функции?
6.  **[ ]** Есть ли документация (`.md`)?
7.  **[ ]** Соответствует ли код требованиям архитектуры?
8.  **[ ]** Можно ли протестировать отдельно?

---

Если любой из этих пунктов не соблюдён — **код считается непригодным для мерджа**.