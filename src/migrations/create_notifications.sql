-- Создаем таблицу уведомлений
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  time TIME NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Добавляем начальные уведомления
INSERT INTO notifications (category, message, time) VALUES
  -- Медитация
  ('meditation', '🧘‍♂️ Доброе утро! Время для утренней медитации. Начни день осознанно!', '07:00:00'),
  ('meditation', '🌙 Вечерняя медитация поможет успокоить ум и лучше спать', '21:00:00'),
  
  -- Тренировка
  ('sport', '💪 Пора размяться! Не забудь про тренировку', '09:00:00'),
  ('sport', '🏃‍♂️ Самое время для активности! Тренировка ждет', '16:00:00'),
  
  -- Вода
  ('water', '💧 Не забывай пить воду! Уже выпил первые 500мл?', '08:00:00'),
  ('water', '💧 Проверь свой водный баланс. Самое время выпить стакан воды!', '11:00:00'),
  ('water', '💧 Напоминаю про воду! Как твой прогресс?', '14:00:00'),
  ('water', '💧 Не забудь восполнить водный баланс!', '17:00:00'); 