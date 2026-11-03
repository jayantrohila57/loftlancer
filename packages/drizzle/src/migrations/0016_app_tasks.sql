-- Tasks app MVP (#246).
CREATE TABLE IF NOT EXISTS task (
  id text PRIMARY KEY,
  organization_id text REFERENCES organization(id) ON DELETE CASCADE,
  project_id text NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  number integer NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'none',
  assignee_id text REFERENCES "user"(id) ON DELETE SET NULL,
  reporter_id text REFERENCES "user"(id) ON DELETE SET NULL,
  due_date timestamptz,
  labels text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS task_project_number_uq ON task (project_id, number);
CREATE INDEX IF NOT EXISTS task_project_status_idx ON task (project_id, status);
CREATE INDEX IF NOT EXISTS task_assignee_idx ON task (assignee_id);

CREATE TABLE IF NOT EXISTS task_comment (
  id text PRIMARY KEY,
  task_id text NOT NULL REFERENCES task(id) ON DELETE CASCADE,
  author_id text REFERENCES "user"(id) ON DELETE SET NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS task_comment_task_idx ON task_comment (task_id, created_at);
