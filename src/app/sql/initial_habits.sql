-- Создаем начальные привычки
INSERT INTO habits (
  id,
  name,
  telegram_id,
  category,
  target_value,
  created_at,
  active
) VALUES 
-- Вода
(
  gen_random_uuid(),
  'Пить воду',
  375634162,
  'water',
  2000,
  NOW(),
  true
),
-- Медитация утром
(
  gen_random_uuid(),
  'Утренняя медитация',
  375634162,
  'meditation',
  15,
  NOW(),
  true
),
-- Спорт
(
  gen_random_uuid(),
  'Тренировка',
  375634162,
  'sport',
  45,
  NOW(),
  true
),
-- Дыхательные практики
(
  gen_random_uuid(),
  'Дыхательные упражнения',
  375634162,
  'breathing',
  10,
  NOW(),
  true
); 