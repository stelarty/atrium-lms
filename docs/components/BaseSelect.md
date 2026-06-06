# BaseSelect

`BaseSelect` — атомарный select для одноэлементного выбора в формах.

## Props

| Название | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `modelValue` | `string \| number \| null` | `null` | Текущее значение |
| `label` | `string` | `''` | Подпись поля |
| `placeholder` | `string` | `'Выберите значение'` | Текст пустого состояния |
| `options` | `BaseSelectOption[]` | — | Список опций |
| `disabled` | `boolean` | `false` | Блокировка поля |
| `error` | `string \| null` | `null` | Текст ошибки |
| `hint` | `string` | `''` | Вспомогательный текст |

## Emits

| Событие | Аргументы | Описание |
| --- | --- | --- |
| `update:modelValue` | `string \| number \| null` | Обновляет выбранное значение |

## Состояния

- `default`
- `focus`
- `disabled`
- `error`
- `placeholder`
