# Life Tracker

Приложение для отслеживания задач, контактов и других аспектов жизни.

## Структура проекта

```
src/
├── app/                      # Next.js app директория
│   ├── components/           # React компоненты
│   │   ├── ContactList.tsx   # Список контактов с анализом истории
│   │   ├── DatabaseInfo.tsx  # Информация о БД
│   │   ├── TableViewer.tsx   # Просмотр данных таблицы
│   │   └── TodoList.tsx      # Список задач
│   ├── contacts/             # Страница контактов
│   │   └── page.tsx
│   ├── utils/               # Утилиты
│   │   └── supabase/        # Конфигурация Supabase
│   ├── globals.css          # Глобальные стили
│   ├── layout.tsx           # Корневой layout
│   └── page.tsx             # Главная страница
├── cli/                     # CLI утилиты
│   └── supabase-manager.ts  # Управление базой данных
└── migrations/              # SQL миграции
    └── create_contacts_table.sql
```

## Функциональность

### Dashboard
- Просмотр всех активных задач и привычек
- Быстрые действия (создание привычек, заметок, просмотр контактов)
- Интеграция с Telegram ботом
- Просмотр статистики базы данных

### Контакты
- Просмотр списка контактов из Telegram
- Анализ истории переписки с помощью DeepSeek AI
- Сохранение результатов анализа в базе данных

### CLI Утилита
```bash
# Показать все таблицы и количество записей
npm run db list-tables

# Импортировать контакты из API
npm run db import-contacts
```

## Переменные окружения

Создайте файл `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
YANDEX_API_KEY=your-yandex-api-key
NEXT_PUBLIC_DEEPSEEK_API_KEY=your-deepseek-api-key
```

## Разработка

```bash
# Установка зависимостей
npm install

# Запуск сервера разработки
npm run dev

# Сборка
npm run build
```
