-- Tasks: comment edit marker (#260).
ALTER TABLE task_comment ADD COLUMN IF NOT EXISTS edited_at timestamptz;
