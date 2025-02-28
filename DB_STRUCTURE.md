# Структура базы данных

## Таблица `todos`
Основная таблица для хранения задач и привычек

- `id` (uuid, PK) - Уникальный идентификатор
- `name` (text) - Название задачи
- `done` (boolean, default: false) - Статус выполнения
- `created_at` (timestamp with time zone) - Дата создания
- `deadline` (timestamp with time zone) - Дедлайн
- `telegram_id` (bigint) - ID пользователя в Telegram
- `notes` (text) - Заметки к задаче
- `repeat_type` (text) - Тип повторения
- `repeat_ends` (timestamp with time zone) - Дата окончания повторений
- `is_habit` (boolean, default: false) - Является ли привычкой
- `category` (text) - Категория
- `tags` (text[]) - Теги

## Таблица `subtasks`
Подзадачи для основных задач

- `id` (uuid, PK) - Уникальный идентификатор
- `todo_id` (uuid, FK -> todos.id) - Ссылка на основную задачу
- `name` (text) - Название подзадачи
- `done` (boolean, default: false) - Статус выполнения
- `created_at` (timestamp with time zone) - Дата создания

## Таблица `habits`
Таблица для хранения привычек

- `id` (uuid, PK) - Уникальный идентификатор
- `telegram_id` (integer) - ID пользователя в Telegram
- `name` (varchar(255)) - Название привычки
- `category` (varchar(50)) - Категория
- `target_value` (integer) - Целевое значение
- `repeat_type` (varchar(20), default: 'daily') - Тип повторения
- `active` (boolean, default: true) - Активна ли привычка
- `created_at` (timestamp with time zone) - Дата создания

## Таблица `habit_logs`
Логи выполнения привычек

- `id` (uuid, PK) - Уникальный идентификатор
- `todo_id` (uuid, FK -> todos.id) - Ссылка на привычку
- `telegram_id` (integer) - ID пользователя в Telegram
- `completed_at` (timestamp with time zone) - Дата выполнения
- `value` (integer) - Значение выполнения
- `created_at` (timestamp with time zone) - Дата создания записи

## Таблица `contacts`
Контакты пользователя

- `id` (uuid, PK) - Уникальный идентификатор
- `name` (text) - Имя контакта
- `telegram_id` (integer) - ID пользователя в Telegram
- `created_at` (timestamp with time zone) - Дата создания

## Таблица `instructions`
Инструкции и подсказки

- `id` (uuid, PK) - Уникальный идентификатор
- `type` (text) - Тип инструкции
- `content` (text) - Содержание
- `created_at` (timestamp with time zone) - Дата создания 