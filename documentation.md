# VI PASSANA App Documentation

## Project Structure

```
src/
├── app/                      # Основная директория приложения
│   ├── actions/             # Server actions для работы с Supabase
│   ├── api/                 # API endpoints
│   ├── components/          # React компоненты
│   │   ├── habits/         # Компоненты привычек
│   │   │   ├── meditation/ # Компоненты медитации
│   │   │   │   ├── modal/     # Подкомпоненты модального окна
│   │   │   │   │   ├── TimerComponent.tsx  # Таймер медитации
│   │   │   │   │   └── ControlButtons.tsx  # Кнопки управления
│   │   │   │   ├── MeditationCalendar.tsx  # Основной компонент календаря
│   │   │   │   ├── MeditationModal.tsx     # Модальное окно медитации
│   │   │   │   ├── MeditationStats.tsx     # Статистика медитаций
│   │   │   │   ├── TodayCard.tsx           # Карточка сегодняшнего дня
│   │   │   │   └── MeditationCalendarGrid.tsx # Адаптивная сетка календаря
│   │   │   └── HabitsList.tsx # Список привычек с красивыми карточками
│   │   └── ui/              # UI компоненты
│   ├── hooks/              # React хуки
│   │   └── useMeditationSession.ts # Хук для управления сессией медитации
│   ├── utils/              # Утилиты
│   │   └── supabase.ts     # Конфигурация и утилиты для Supabase
│   ├── page.tsx            # Главная страница с привычками
│   ├── layout.tsx          # Основной layout
│   └── globals.css         # Глобальные стили и темы

## Основные фичи и компоненты

### Meditation Module
- `MeditationCalendar`: 
  - Адаптивный календарь (2/3/5/7 дней в ряд)
  - Анимированные эффекты для сессий
  - Отображение утренних/вечерних сессий
  - Индикация выполненных дней

- `MeditationModal`: 
  - Таймер с возможностью добавить время (+30 минут)
  - Звук гонга по окончании (/public/gong.wav)
  - Анимированный интерфейс
  - Сохранение прогресса в Supabase

### Habits Module
- `HabitsList`: 
  - Адаптивные карточки привычек
  - Градиентные иконки
  - Hover эффекты
  - Прямая навигация к привычкам

## Database Schema (Supabase)

### meditation_sessions
- uuid: string (PRIMARY KEY)
- user_id: string
- date: string (YYYY-MM-DD)
- type: string (morning/evening)
- duration: number (в минутах)
- completed: boolean
- created_at: timestamp

## Routing Structure
- `/` - Главная с привычками
- `/habits/meditation` - Календарь медитаций
- `/sport` - Спорт (планируется)
- `/water` - Вода (планируется)
- `/sleep` - Сон (планируется)

## UI/UX Features
- Адаптивный дизайн для всех экранов
- Анимации с Framer Motion
- Градиентные эффекты
- Интерактивные элементы
- Звуковые эффекты

## Planned Improvements
1. Интеграция с другими привычками:
   - Спорт
   - Вода
   - Режим сна

2. Улучшение аналитики:
   - Графики прогресса
   - Статистика по неделям/месяцам
   - Достижения

3. Социальные фичи:
   - Шеринг прогресса
   - Групповые челленджи

4. Технические улучшения:
   - Оптимизация производительности
   - Улучшенная обработка ошибок
   - Кэширование данных 