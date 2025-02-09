-- Таблица привычек (шаблоны)
CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  telegram_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- water, sport, meditation, breathing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  repeat_type VARCHAR(20) NOT NULL, -- daily, weekly
  active BOOLEAN DEFAULT true,
  target_value INTEGER NOT NULL, -- целевое значение в минутах для медитации/спорта/дыхания или мл для воды
  end_date DATE -- когда привычка должна закончиться (опционально)
);

-- Таблица логов выполнения привычек
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  telegram_id INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  value INTEGER NOT NULL, -- фактическое значение в минутах или мл
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрой выборки
CREATE INDEX IF NOT EXISTS idx_habits_telegram_id ON habits(telegram_id);
CREATE INDEX IF NOT EXISTS idx_habits_category ON habits(category);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_completed_at ON habit_logs(completed_at);

-- Функция для получения статистики привычки за период
CREATE OR REPLACE FUNCTION get_habit_stats(
  p_habit_id UUID,
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP
) RETURNS TABLE (
  total_value BIGINT,
  completion_rate FLOAT,
  streak INTEGER
) AS $$
DECLARE
  v_target_value INTEGER;
  v_category VARCHAR;
  v_current_streak INTEGER := 0;
  v_max_streak INTEGER := 0;
BEGIN
  -- Получаем целевое значение и категорию привычки
  SELECT target_value, category INTO v_target_value, v_category
  FROM habits WHERE id = p_habit_id;

  RETURN QUERY
  WITH daily_logs AS (
    SELECT 
      date_trunc('day', completed_at) as log_date,
      SUM(value) as daily_value
    FROM habit_logs
    WHERE habit_id = p_habit_id
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
  daily_completion AS (
    SELECT 
      d.day,
      COALESCE(l.daily_value >= v_target_value, false) as is_completed
    FROM days_in_range d
    LEFT JOIN daily_logs l ON d.day = l.log_date
    ORDER BY d.day DESC
  ),
  streak_calc AS (
    SELECT 
      day,
      is_completed,
      CASE 
        WHEN is_completed THEN 
          CASE 
            WHEN LAG(is_completed) OVER (ORDER BY day) = true OR LAG(is_completed) OVER (ORDER BY day) IS NULL 
            THEN 1 
            ELSE 0 
          END
        ELSE 0 
      END as continues_streak
    FROM daily_completion
  )
  SELECT 
    COALESCE(SUM(l.daily_value), 0)::BIGINT as total_value,
    (COUNT(CASE WHEN l.daily_value >= v_target_value THEN 1 END)::FLOAT / 
     COUNT(d.day)::FLOAT * 100)::FLOAT as completion_rate,
    COALESCE(
      (SELECT COUNT(*) 
       FROM streak_calc 
       WHERE is_completed = true 
       AND continues_streak = 1 
       LIMIT 1),
      0
    )::INTEGER as streak
  FROM days_in_range d
  LEFT JOIN daily_logs l ON d.day = l.log_date;
END;
$$ LANGUAGE plpgsql; 