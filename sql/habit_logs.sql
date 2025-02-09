-- Таблица логов выполнения привычек
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  todo_id UUID REFERENCES todos(id) ON DELETE CASCADE,
  telegram_id INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  value INTEGER NOT NULL, -- значение в мл или минутах
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрой выборки
CREATE INDEX IF NOT EXISTS idx_habit_logs_todo_id ON habit_logs(todo_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_telegram_id ON habit_logs(telegram_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_completed_at ON habit_logs(completed_at);

-- Функция для получения статистики за период
CREATE OR REPLACE FUNCTION get_habit_stats(
  p_todo_id UUID,
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP
) RETURNS TABLE (
  total_value BIGINT,
  completion_rate FLOAT,
  streak INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH daily_logs AS (
    SELECT 
      date_trunc('day', completed_at) as log_date,
      SUM(value) as daily_value,
      COUNT(*) as completions
    FROM habit_logs
    WHERE todo_id = p_todo_id
      AND completed_at BETWEEN p_start_date AND p_end_date
    GROUP BY date_trunc('day', completed_at)
  ),
  days_in_range AS (
    SELECT generate_series(
      date_trunc('day', p_start_date),
      date_trunc('day', p_end_date),
      '1 day'::interval
    ) as day
  ),
  streak_calc AS (
    SELECT 
      COUNT(*) as streak_length
    FROM (
      SELECT 
        log_date,
        row_number() OVER (ORDER BY log_date DESC) as rn
      FROM daily_logs
      WHERE completions > 0
    ) t
    WHERE rn = 1
  )
  SELECT 
    COALESCE(SUM(daily_value), 0)::BIGINT as total_value,
    (COUNT(daily_value)::FLOAT / COUNT(*)::FLOAT * 100)::FLOAT as completion_rate,
    COALESCE((SELECT streak_length FROM streak_calc), 0)::INTEGER as streak
  FROM days_in_range d
  LEFT JOIN daily_logs l ON d.day = l.log_date;
END;
$$ LANGUAGE plpgsql; 