# Документация проекта

## Архитектура

Проект построен на Next.js с использованием Supabase для хранения данных и real-time обновлений.

### База данных

#### Таблица `todos`
```sql
create table todos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  done boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  deadline timestamp with time zone,
  telegram_id bigint not null,
  category text,
  comment text,
  contact_id text,
  is_habit boolean default false
);

create index todos_telegram_id_idx on todos(telegram_id);
create index todos_category_idx on todos(category);
create index todos_done_idx on todos(done);
```

#### Таблица `habits`
```sql
create table habits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  telegram_id bigint not null,
  category text not null,
  target_value integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  active boolean default true
);

create index habits_telegram_id_idx on habits(telegram_id);
create index habits_category_idx on habits(category);
create index habits_active_idx on habits(active);
```

#### Таблица `habit_logs`
```sql
create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id),
  value integer not null,
  completed_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index habit_logs_habit_id_idx on habit_logs(habit_id);
create index habit_logs_completed_at_idx on habit_logs(completed_at);
```

### Функции SQL

#### get_habit_stats
```sql
create or replace function get_habit_stats(
  p_habit_id uuid,
  p_days integer
)
returns table (
  total_value bigint,
  completion_rate float,
  current_streak integer,
  average_value float
) as $$
declare
  v_start_date date;
  v_target_value integer;
begin
  -- Получаем целевое значение привычки
  select target_value into v_target_value
  from habits
  where id = p_habit_id;

  -- Устанавливаем начальную дату
  v_start_date := current_date - p_days + 1;

  return query
  with daily_logs as (
    -- Группируем логи по дням
    select
      date_trunc('day', completed_at)::date as log_date,
      sum(value) as daily_value
    from habit_logs
    where
      habit_id = p_habit_id
      and completed_at >= v_start_date
    group by date_trunc('day', completed_at)::date
  ),
  daily_completion as (
    -- Определяем выполнение цели для каждого дня
    select
      log_date,
      daily_value >= v_target_value as is_completed
    from daily_logs
  ),
  streak_calc as (
    -- Вычисляем текущую серию
    select
      count(*) as current_streak
    from (
      select log_date
      from daily_completion
      where is_completed
      and log_date > (
        select coalesce(max(log_date), current_date)
        from daily_completion
        where not is_completed
      )
    ) s
  )
  select
    coalesce(sum(dl.daily_value), 0) as total_value,
    coalesce(
      count(*) filter (where dc.is_completed)::float / p_days,
      0
    ) as completion_rate,
    coalesce(sc.current_streak, 0) as current_streak,
    coalesce(
      sum(dl.daily_value)::float / p_days,
      0
    ) as average_value
  from
    generate_series(
      v_start_date,
      current_date,
      '1 day'::interval
    ) as dates(date)
    left join daily_logs dl on dl.log_date = dates.date
    left join daily_completion dc on dc.log_date = dates.date
    cross join streak_calc sc;
end;
$$ language plpgsql;
```

## Ключевые компоненты

### TodoList
- Отображение списка задач
- Фильтрация по статусу (активные/выполненные)
- Быстрые действия: отметить выполненной, изменить дедлайн
- Модальное окно для редактирования задачи
- Real-time обновления через Supabase

### TodoCard
- Отображение информации о задаче
- Градиент фона в зависимости от категории
- Кнопки быстрых действий
- Анимации при изменении состояния

### HabitsList
- Отображение списка привычек
- Сортировка по времени создания
- Real-time обновления через Supabase

### HabitCard
- Отображение информации о привычке
- Прогресс-бар для отслеживания выполнения
- Быстрый ввод значений через модальное окно
- Статистика по долгому нажатию:
  - Общее значение за 30 дней
  - Процент выполнения за 7 дней
  - Текущая серия
  - График за неделю

## Следующие шаги

1. Оптимизация производительности:
   - Кеширование результатов запросов
   - Виртуализация списков
   - Оптимизация SQL запросов

2. Улучшение UX:
   - Добавить анимации для всех действий
   - Улучшить отображение на мобильных устройствах
   - Добавить подтверждение для важных действий

3. Новые функции:
   - Уведомления о привычках
   - Достижения и награды
   - Экспорт статистики
   - Социальные функции (делиться прогрессом) 