# TASK.md

## Текущие задачи

| Задача                                                     | Статус       | Дата       | Примечания                                                   |
| ---------------------------------------------------------- | ------------ | ---------- | ------------------------------------------------------------ |
| Устранение черного экрана при запуске                       | 🟡 В процессе | 2024-06-13 | Экран становится черным сразу при запуске приложения           |
| Миграции: добавить habit_id, категории, теги, историю        | 🟢 Выполнено | 2024-06-14 | Выполнено через MCP Supabase                               |
| Обновить типы Todo, Habit, Category, Tag, History         | 🟢 Выполнено | 2024-06-14 | Обновлены/созданы типы в src/types                         |
| Обновить API-запросы для новых связей и фильтров           | 🔴 Не начато  | 2024-06-14 | Включая фильтры по категориям/тегам, историю изменений      |
| Внедрить новые UI-фичи                                     | 🔴 Не начато  | 2024-06-14 | Фильтры, поиск, drag-and-drop, кастомные категории/теги |
| Интегрировать логику Telegram SDK & Layout (Providerы/Хуки) | 🟡 В процессе | 2024-06-14 | Рефакторинг отступов, fullscreen, swipes, auth через SDK   |
|   6.1 Установить `@telegram-apps/sdk-react`                  | 🔴 Не начато  | 2024-06-14 |                                                              |
|   6.2 Создать `TelegramProvider` и `useTelegramSDK`          | 🔴 Не начато  | 2024-06-14 | Базовый доступ к SDK                                         |
|   6.3 Создать `AuthProvider` и `useAuth`, рефакторить auth   | 🔴 Не начато  | 2024-06-14 | Использовать initData из SDK                               |
|   6.4 Перенести `layoutConfig`, создать `LayoutProvider`/`useLayout` | 🔴 Не начато  | 2024-06-14 | Централизованное управление layout'ом                     |
|   6.5 Создать и применить `SafeAreaWrapper`                  | 🔴 Не начато  | 2024-06-14 | Компонент для применения отступов                          |
|   6.6 Удалить старую логику Telegram API и отступов         | 🔴 Не начато  | 2024-06-14 | Чистка legacy кода                                           |
|   6.7 Настроить `layoutConfig.ts` и провести тестирование   | 🔴 Не начато  | 2024-06-14 | Финальная настройка и проверка                             |
| Фиксировать прогресс в TASK.md и PRD.md                     | 🟡 В процессе | 2024-06-14 |                                                              |

## Обнаружено в ходе работы

-   🟢 Создать PLANNING.md и TASK.md для стандартизации (2024-06-13)
-   🟡 Диагностика фронтенда (логи, окружение, билд)

## Детальный план задачи "Устранение черного экрана при запуске"

### 1. Диагностика проблемы

-   🔴 Исследовать логи консоли во время запуска
-   🔴 Проверить структуру проекта и файлы конфигурации
-   🔴 Осмотреть файлы роутинга Next.js (app/page.tsx, layout.tsx)
-   🔴 Проверить компоненты верхнего уровня на наличие ошибок
-   🔴 Проверить хуки и контексты на правильность инициализации

### 2. Локализация проблемы

-   🔴 Определить компонент/модуль, вызывающий проблему
-   🔴 Проверить зависимости и их версии
-   🔴 Проанализировать стили и темы (TailwindCSS конфигурацию)
-   🔴 Исследовать взаимодействие с Supabase на предмет блокирующих операций

### 3. Исправление

-   🔴 Внести исправления в проблемные модули
-   🔴 Добавить обработку ошибок и предохранители
-   🔴 Оптимизировать порядок загрузки и инициализации
-   🔴 Добавить диагностические логи

### 4. Тестирование и верификация

-   🔴 Проверить исправления в разных режимах (dev, build)
-   🔴 Провести тестирование производительности
-   🔴 Убедиться в отсутствии регрессий в других частях

---

_Статусы: 🔴 Не начато, 🟡 В процессе, 🟢 Выполнено_ 