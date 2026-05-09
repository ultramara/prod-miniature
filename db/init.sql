CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS messages (
    message_id UUID PRIMARY KEY DEFAULT uuidv7(),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

COMMENT ON TABLE messages IS 'Сообщения пользователей';
COMMENT ON COLUMN messages.message_id IS 'UUID v7 сообщения';
COMMENT ON COLUMN messages.message IS 'Текст сообщения';
COMMENT ON COLUMN messages.created_at IS 'Дата и время создания';
