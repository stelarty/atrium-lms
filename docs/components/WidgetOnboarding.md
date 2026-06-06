# WidgetOnboarding
`WidgetOnboarding` - виджет приветствия и онбординга для новых студентов LMS Atrium.

Компонент сам загружает статус онбординга с API, собирает список шагов, управляет локальным UI-состоянием и скрывает себя, когда онбординг завершен и уже просмотрен.

## Архитектура

Текущая структура соответствует правилам из `docs/components.md` для составных widget-компонентов:

```text
src/components/widgets/
|-- WidgetOnboarding.vue
`-- _onboarding/
    |-- OnboardingHeader.vue
    |-- OnboardingTask.vue
    |-- OnboardingTasks.vue
    `-- useOnboarding.ts
```

- `WidgetOnboarding.vue` - тонкий container-компонент, который только связывает composable и подкомпоненты.
- `_onboarding/OnboardingHeader.vue` - presentational-компонент шапки.
- `_onboarding/OnboardingTask.vue` - presentational-компонент одной задачи.
- `_onboarding/OnboardingTasks.vue` - список задач.
- `_onboarding/useOnboarding.ts` - локальный composable с бизнес-логикой widget'а.

## Почему `useOnboarding.ts` лежит в `_onboarding`

Для текущей реализации это удачное место.

- Логика жестко привязана к одному widget'у: к его API-контракту, текстам, картинкам, правилам отображения и структуре задач.
- Файл не выглядит как общий composable уровня приложения, который уже переиспользуется в нескольких местах.
- Соседство с `WidgetOnboarding.vue` и подкомпонентами упрощает навигацию и рефакторинг: вся фича лежит компактно в одном месте.
- Такое размещение прямо соответствует разделу про composite widgets в `docs/components.md`.

Выносить в общий `src/composables/` или в отдельную доменную папку имеет смысл, когда выполнится хотя бы одно из условий:

- эту логику начнут использовать другие страницы или widget'ы;
- появится несколько onboarding-сценариев с общей моделью данных;
- понадобится независимое тестирование и развитие domain-слоя отдельно от UI-структуры widget'а.

Пока этого нет, локальный `useOnboarding.ts` рядом с widget'ом выглядит архитектурно чище, чем преждевременный вынос "на вырост".

## Поведение

### GET `/api/edspace/onboarding/`

Незавершенный онбординг:

```json
{
  "onboarding_done": false,
  "step_platform_visited": true,
  "step_joined_telegram": false,
  "step_completed_first_homework": false
}
```

Завершенный онбординг:

```json
{
  "onboarding_done": true,
  "is_seen": false
}
```

### PATCH `/api/edspace/onboarding/`

При закрытии завершенного онбординга отправляется:

```json
{
  "is_seen": true
}
```

## Логика отображения

- Если `onboarding_done: false`, widget показывается, можно разворачивать список задач, отображаются статусы шагов.
- Если `onboarding_done: true` и `is_seen: false`, widget показывается в завершенном состоянии без списка задач и без стрелки разворачивания.
- Если `onboarding_done: true` и `is_seen: true`, widget не показывается.

## Статусы задач

| Статус | Значение |
|---|---|
| `completed` | шаг выполнен |
| `current` | первый невыполненный шаг |
| `pending` | следующие шаги, которые пока недоступны |

## Связанные файлы

- `src/api/onboarding.ts` - API-вызовы `fetchOnboarding()` и `updateOnboarding()`
- `src/api/types/onboarding.ts` - типы ответа и payload
- `src/styles/components/_widget-onboarding.scss` - стили widget'а

## Актуальное качество реализации

- Типизация в компонентах есть: используются `defineProps` и `defineEmits`.
- Бизнес-логика уже вынесена в composable.
- `WidgetOnboarding.vue` остается тонким контейнером.
- Документация теперь соответствует текущей структуре и ответственности файлов.
etOnboarding.md`        |
| Строгая типизация        | ⚠️ TypeScript interface не определена           |
| Нет `any`                | ✅ All typed                                    |
| one-component = one-file | ✅ Да                                           |
| Префикс соответствует    | ✅ Widget                                       |
|_props/emitstипизированы  | ⚠️ Нужно добавить `defineProps` и `defineEmits` |tOnboarding.md`        |
| Строгая типизация        | ⚠️ TypeScript interface не определена           |
| Нет `any`                | ✅ All typed                                    |
| one-component = one-file | ✅ Да                                           |
| Префикс соответствует    | ✅ Widget                                       |
|_props/emitstипизированы  | ⚠️ Нужно добавить `defineProps` и `defineEmits` |