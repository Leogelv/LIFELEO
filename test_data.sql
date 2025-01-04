-- Сначала удаляем все старые записи
DELETE FROM sport_sessions;
DELETE FROM water_intake;
DELETE FROM sleep_tracking;

-- Тестовые записи для спорта (январь 2025)
INSERT INTO sport_sessions (telegram_id, date, exercise_type, duration, intensity, notes) VALUES
    (375634162, '2025-01-15', 'Йога', 45, 'medium', 'Утренняя практика йоги'),
    (375634162, '2025-01-16', 'Силовая', 60, 'high', 'Тренировка в зале, фокус на ноги'),
    (375634162, '2025-01-17', 'Бег', 30, 'high', 'Пробежка в парке, 5км');

-- Тестовые записи потребления воды
INSERT INTO water_intake (telegram_id, date, amount, time_of_day) VALUES
    (375634162, '2025-01-15', 750, '09:00'),
    (375634162, '2025-01-16', 500, '14:00'),
    (375634162, '2025-01-17', 600, '18:00');

-- Тестовые записи сна
INSERT INTO sleep_tracking (telegram_id, date, sleep_start, sleep_end, quality, deep_sleep_duration, notes) VALUES
    (375634162, '2025-01-15', '2025-01-15 23:00:00+00', '2025-01-16 07:00:00+00', 5, 120, 'Отличный сон, проснулся бодрым'),
    (375634162, '2025-01-16', '2025-01-16 23:30:00+00', '2025-01-17 07:30:00+00', 4, 100, 'Хороший сон'),
    (375634162, '2025-01-17', '2025-01-17 23:15:00+00', '2025-01-18 07:15:00+00', 5, 110, 'Глубокий сон'); 

-- Create todos table
create table if not exists todos (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  done boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deadline timestamp with time zone not null,
  telegram_id bigint not null
);

-- Create index for better performance
create index if not exists todos_telegram_id_idx on todos(telegram_id);
create index if not exists todos_deadline_idx on todos(deadline);

-- Add some test todos for default user
insert into todos (telegram_id, name, done, created_at, deadline) values
  (375634162, 'Сделать зарядку', false, now(), now() + interval '2 hours'),
  (375634162, 'Купить продукты', false, now(), now() + interval '1 day'),
  (375634162, 'Почитать книгу', false, now(), now() - interval '1 hour'); 