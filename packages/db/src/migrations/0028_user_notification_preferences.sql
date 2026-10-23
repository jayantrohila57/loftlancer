-- User-owned delivery preferences for notification event groups (#648).
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS notification_preferences jsonb NOT NULL
  DEFAULT '{"invitations":{"inApp":true,"email":true},"membership":{"inApp":true,"email":false},"projectActivity":{"inApp":true,"email":false},"support":{"inApp":true,"email":false}}'::jsonb;
