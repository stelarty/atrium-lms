# BaseChip

Статусный бейдж из [DS LMS (Figma)](https://www.figma.com/design/UyJpJMuZkXvcpqB03l1TMD/DS-LMS?node-id=2457-222).

## Варианты (`variant`)

| Значение | Назначение |
|----------|------------|
| `success` | Успех, «в эфире», проверено |
| `warning` | Ожидание, на проверке |
| `danger` | Ошибка, просрочено |
| `additional` | Акцент: требует решения, назначена отслушка |
| `neutral` | Неизвестный статус (fallback) |

Маппинг статусов ДЗ: `@/utils/student-lesson-labels.ts` (`resolveStudentHomeworkStatusMeta` в `@/utils/student-lesson-homework.ts`).

## Props

| Prop | Тип | По умолчанию |
|------|-----|--------------|
| `label` | `string` | — |
| `variant` | `BaseChipVariant` \| `'accent'` | `neutral` |
| `href` | `string` | — (рендер `<a>`) |
| `target` | `'_self'` \| `'_blank'` | `'_blank'` |
| `title` | `string` | — |

Слот переопределяет `label`.

## Пример

```vue
<BaseChip variant="success">В прямом эфире</BaseChip>
<BaseChip variant="additional" href="https://example.com">example.com</BaseChip>
```
