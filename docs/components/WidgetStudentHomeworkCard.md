# WidgetStudentHomeworkCard

**WidgetStudentHomeworkCard** — карточка домашнего задания студента (письменное, тест, устное).  
Используется на вкладке «Домашние задания» курса и на странице занятия.

Компонент **презентационный**: данные приходят через `StudentHomeworkCardViewModel`, маппинг выполняется в `@/utils/student-homework`.

---

## Особенности

- Один блок UI для всех типов ДЗ (`written`, `test`, `oral`)
- Статус, дедлайн, файлы, кнопки действий — по view-model
- Кнопка «Сдать» для письменных заданий — событие `submit` (загрузка файла в родительской view)
- Без store, router и прямых API-вызовов

---

## Props

| Название | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `item` | `StudentHomeworkCardViewModel` | — | Данные карточки для отображения |
| `submitLoading` | `boolean` | `false` | Состояние отправки письменного ДЗ |

---

## Emits

| Событие | Аргументы | Описание |
|---------|-----------|----------|
| `submit` | `homeworkId`, `lessonId` | Открыть выбор файла решения (письменное ДЗ) |

Тест / устное — через `href` на `BaseButton`.

---

## View model (`StudentHomeworkCardViewModel`)

Определён в `@/types/student-homework`. Основные поля:

| Поле | Описание |
|------|----------|
| `key` | Уникальный ключ для `v-for` |
| `type` | `written` \| `test` \| `oral` |
| `title` | Заголовок карточки |
| `deadlineLabel` | Текст дедлайна |
| `isOverdueDeadline` | Подсветка просрочки |
| `statusLabel` / `statusVariant` | Бейдж статуса (`BaseChip`) |
| `files` | Вложения (`MaterialFileItem[]`) |
| `homeworkId` / `lessonId` | Идентификаторы для отправки |
| `showSubmitButton` / `submitButtonLabel` | Письменное ДЗ |
| `actionUrl` / `actionLabel` | Тест / устное |
| `listeningInfoLabel` | Инфо по устному |
| `scoreText` | Итоговый балл |

Маппер: `mapStudentHomeworkToCardViewModel` в `@/utils/student-homework`.

---

## CSS-классы

```text
widget-student-homework-card
widget-student-homework-card--{type}
widget-student-homework-card__head
widget-student-homework-card__title
widget-student-homework-card__deadline
widget-student-homework-card__deadline-value
widget-student-homework-card__deadline-value--overdue
widget-student-homework-card__status
widget-student-homework-card__status--{variant}
widget-student-homework-card__oral-info
widget-student-homework-card__submit
widget-student-homework-card__oral-action
widget-student-homework-card__score
```

Стили: `@/styles/components/_widget-student-homework-card.scss`.

---

## Пример использования

```vue
<WidgetStudentHomeworkCard
  v-for="card in homeworkItems"
  :key="card.key"
  :item="card"
/>
```

```ts
import WidgetStudentHomeworkCard from '@/components/widgets/WidgetStudentHomeworkCard.vue'
import { mapStudentHomeworkToCardViewModel } from '@/utils/student-homework'
```

---

## Связанные файлы

- `@/utils/student-homework.ts` — маппинг и группировка по урокам
- `@/utils/student-lesson-labels.ts` — подписи статусов и кнопок
- `@/views/student/course/HomeworkView.vue` — список по курсу
- `@/views/student/course/LessonView.vue` — блок ДЗ на странице занятия
