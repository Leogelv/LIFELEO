-- Создаем таблицу для контактов
CREATE TABLE IF NOT EXISTS contacts_userbot_leo (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  last_message TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  unread_count INTEGER DEFAULT 0,
  history JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_contacts_userbot_leo_user_id ON contacts_userbot_leo(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_userbot_leo_username ON contacts_userbot_leo(username);
CREATE INDEX IF NOT EXISTS idx_contacts_userbot_leo_is_pinned ON contacts_userbot_leo(is_pinned); 