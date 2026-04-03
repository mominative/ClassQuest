
-- Add status enum
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'done');

-- Add status column to Tasks
ALTER TABLE public."Tasks" ADD COLUMN status task_status NOT NULL DEFAULT 'todo';

-- Add created_at for ordering
ALTER TABLE public."Tasks" ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
