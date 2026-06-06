# BaseDate

`BaseDate` — атомарное поле даты на основе нативного `input[type="date"]`.

## Props

| Название | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `modelValue` | `string \| null` | `null` | Значение даты в формате `YYYY-MM-DD` |
| `label` | `string` | `''` | Подпись поля |
| `placeholder` | `string` | `''` | Зарезервировано под будущий UX |
| `min` | `string` | `''` | Минимальная дата |
| `max` | `string` | `''` | Максимальная дата |
| `disabled` | `boolean` | `false` | Блокировка поля |
| `error` | `string \| null` | `null` | Текст ошибки |
| `hint` | `string` | `''` | Вспомогательный текст |

## Emits

| Событие | Аргументы | Описание |
| --- | --- | --- |
| `update:modelValue` | `string \| null` | Обновляет дату |
| `blur` | `FocusEvent` | Пробрасывает blur наружу |

## Состояния

- `default`
- `focus`
- `disabled`
- `error`
