# VI PASSANA App Documentation

## Project Structure

```
src/
├── app/                    # Основная директория Next.js приложения
│   ├── api/               # API endpoints
│   │   ├── analyze/      # Анализ диалогов через DeepSeek
│   │   ├── contacts/     # Работа с контактами
│   │   └── tasks/        # Анализ и управление задачами
│   │
│   ├── components/        # React компоненты
│   │   ├── habits/       # Компоненты для привычек
│   │   │   ├── HabitCard.tsx           # Карточка привычки с градиентом
│   │   │   ├── UniversalCalendarGrid.tsx # Базовый компонент календаря
│   │   │   ├── WaterCalendarGrid.tsx   # Календарь для воды
│   │   │   └── meditation/             # Компоненты медитации
│   │   │       ├── modal/              # Модальное окно медитации
│   │   │       │   ├── MeditationModal.tsx  # Основное модальное окно
│   │   │       │   └── ModalBackground.tsx  # Анимированный фон
│   │   │
│   │   ├── BottomMenu.tsx   # Нижнее меню навигации
│   │   └── TelegramScript.tsx # Интеграция с Telegram WebApp
│   │
│   ├── contexts/         # React контексты
│   │   └── UserContext.tsx # Контекст пользователя с Telegram ID
│   │
│   ├── habits/          # Страницы привычек
│   │   ├── meditation/  # Страница медитации
│   │   ├── water/      # Страница воды
│   │   └── tasks/      # Страница задач
│   │
│   ├── hooks/           # React хуки
│   │   ├── useTelegram.ts      # Хук для работы с Telegram WebApp
│   │   └── useWaterSessions.ts # Хук для работы с сессиями воды
│   │
│   ├── types/           # TypeScript типы
│   │   └── telegram-webapp.d.ts # Типы для Telegram WebApp
│   │
│   ├── profile/         # Страница профиля
│   │   └── page.tsx     # Редактирование целей и навыков
│   │
│   ├── voice-agent/     # Голосовой агент
│   │   └── page.tsx     # Интеграция с KPCaller
│   │
│   ├── page.tsx         # Главная страница
│   └── layout.tsx       # Основной layout
```

## Компоненты и их взаимодействие

### Telegram Integration
- `hooks/useTelegram.ts`:
  - Управляет интеграцией с Telegram WebApp
  - Предоставляет методы для работы с WebApp API
  - Поддерживает тестовый режим с фиксированным ID
  - Управляет фулскрином и цветовой схемой

- `components/TelegramScript.tsx`:
  - Подключает Telegram WebApp скрипт
  - Обеспечивает доступ к Telegram API

### Habits System
- `components/habits/HabitCard.tsx`:
  - Красивые карточки с градиентами
  - Анимации при наведении
  - Интеграция с иконками Solar

- `components/habits/UniversalCalendarGrid.tsx`:
  - Базовый компонент для всех календарей
  - Адаптивная сетка
  - Поддержка разных типов данных

### Water Tracking
- `habits/water/page.tsx`:
  - Интерфейс добавления воды
  - Предустановленные значения
  - Календарь потребления

- `hooks/useWaterSessions.ts`:
  - Управление сессиями воды
  - Синхронизация с Supabase
  - Кэширование данных

### Profile System
- `profile/page.tsx`:
  - Редактирование профиля пользователя
  - Сохранение в Supabase
  - Поддержка целей и навыков

### Navigation
- `components/BottomMenu.tsx`:
  - Нижняя навигация
  - Анимированные иконки
  - Интеграция с next/navigation

## Database Schema (Supabase)

### uzerz
- telegram_id: number (PRIMARY KEY)
- priorities: text
- short_term_goals: text
- long_term_goals: text
- skills: text
- created_at: timestamp

### water_sessions
- id: uuid (PRIMARY KEY)
- user_id: number (foreign key -> uzerz.telegram_id)
- amount: number
- date: timestamp
- created_at: timestamp

## API Endpoints

### /api/tasks
- POST: Анализирует сообщения пользователя через DeepSeek
- Возвращает структурированный список задач
- Требует telegram_id в теле запроса

### /api/analyze
- POST: Анализирует диалоги через DeepSeek
- Возвращает психологический анализ
- Поддерживает различные аспекты анализа

## Planned Features
1. Расширение системы привычек:
   - Спорт с типами тренировок
   - Сон с анализом качества
   - Финансовый трекер

2. Улучшение аналитики:
   - Графики и визуализации
   - Еженедельные отчеты
   - Интеграция с AI для рекомендаций

3. Социальные функции:
   - Групповые челленджи
   - Шеринг достижений
   - Рейтинги и награды

## Tech Stack
- Next.js 14
- Supabase
- Telegram WebApp API
- DeepSeek AI
- TailwindCSS
- Framer Motion 