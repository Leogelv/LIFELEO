-- Таблица для отслеживания спорта
CREATE TABLE sport_sessions (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    date DATE NOT NULL,
    exercise_type VARCHAR(50) NOT NULL,
    duration INTEGER NOT NULL, -- в минутах
    intensity VARCHAR(20) CHECK (intensity IN ('low', 'medium', 'high')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для отслеживания воды
CREATE TABLE water_intake (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    date DATE NOT NULL,
    amount INTEGER NOT NULL, -- в миллилитрах
    time_of_day TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для отслеживания сна
CREATE TABLE sleep_tracking (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    date DATE NOT NULL,
    sleep_start TIMESTAMP WITH TIME ZONE NOT NULL,
    sleep_end TIMESTAMP WITH TIME ZONE NOT NULL,
    quality INTEGER CHECK (quality BETWEEN 1 AND 5), -- оценка качества сна
    deep_sleep_duration INTEGER, -- в минутах
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_sport_telegram_date ON sport_sessions(telegram_id, date);
CREATE INDEX idx_water_telegram_date ON water_intake(telegram_id, date);
CREATE INDEX idx_sleep_telegram_date ON sleep_tracking(telegram_id, date);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sport_sessions_updated_at
    BEFORE UPDATE ON sport_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 