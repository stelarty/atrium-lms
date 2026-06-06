# BaseTextarea

`BaseTextarea` — многострочное поле ввода по [DS-LMS Textarea](https://www.figma.com/design/UyJpJMuZkXvcpqB03l1TMD/DS-LMS?node-id=2030-6420).

Минимальная высота — не меньше трёх строк (~100px). Ограничение символов задаётся через `maxlength`; счётчик в hint — автоматически (`current/max`), если не передан свой `hint`.

## Props

| Название | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | Текущее значение |
| `label` | `string` | `''` | Подпись поля |
| `placeholder` | `string` | `''` | Placeholder |
| `disabled` | `boolean` | `false` | Блокировка поля |
| `readonly` | `boolean` | `false` | Только чтение |
| `required` | `boolean` | `false` | Обязательное поле (звёздочка) |
| `error` | `string \| null` | `null` | Текст ошибки |
| `hint` | `string` | `''` | Вспомогательный текст |
| `maxlength` | `number` | — | Лимит символов |
| `counter` | `boolean` | `false` | Счётчик внутри поля |
| `showLengthHint` | `boolean` | `true` | `current/max` в hint при `maxlength` |
| `rows` | `number` | — | Атрибут `rows` (опционально) |

## Emits

| Событие | Аргументы | Описание |
| --- | --- | --- |
| `update:modelValue` | `string` | Обновляет значение |
| `blur` | `FocusEvent` | Пробрасывает blur наружу |

## Состояния

- `default` / `hover` / `focus`
- `error`
- `readonly`
- `disabled`
