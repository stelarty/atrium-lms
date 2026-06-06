# BaseInput

`BaseInput` — атомарное текстовое поле проекта для форм.

## Props

| Название | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | Текущее значение |
| `label` | `string` | `''` | Подпись поля |
| `placeholder` | `string` | `''` | Placeholder |
| `type` | `'text' \| 'url' \| 'number' \| 'search'` | `'text'` | Тип input |
| `disabled` | `boolean` | `false` | Блокировка поля |
| `error` | `string \| null` | `null` | Текст ошибки |
| `hint` | `string` | `''` | Вспомогательный текст |

## Emits

| Событие | Аргументы | Описание |
| --- | --- | --- |
| `update:modelValue` | `string` | Обновляет значение |
| `blur` | `FocusEvent` | Пробрасывает blur наружу |

## Состояния

- `default`
- `focus`
- `disabled`
- `error`
