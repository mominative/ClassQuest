
-- =========================================================================
-- PHASE 0: ClassQuest foundation cleanup
-- =========================================================================

-- 1. Drop unused/duplicate tables
DROP TABLE IF EXISTS public."Submissions" CASCADE;
DROP TABLE IF EXISTS public."Roles" CASCADE;
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- 2. Drop dependent functions/triggers
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.prevent_role_self_update() CASCADE;

-- 3. Re-define app_role enum
DROP TYPE IF EXISTS public.app_role CASCADE;
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

-- 4. user_roles table
CREATE TABLE public.user_roles (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role      public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_teacher(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('teacher','admin'))
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_teacher(auth.uid()));

-- 5. Backfill
UPDATE public.profiles SET role = 'student' WHERE role IS NULL OR role NOT IN ('teacher','student','admin');

INSERT INTO public.user_roles (user_id, role)
SELECT p.id,
  CASE WHEN p.role IN ('teacher','admin') THEN 'teacher'::public.app_role
       ELSE 'student'::public.app_role END
FROM public.profiles p
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.profiles (id, full_name, total_xp, current_level, daily_streak, role)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'full_name',''), 0, 1, 0,
       CASE WHEN u.email = 'teacher@test.com' THEN 'teacher' ELSE 'student' END
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id,
       CASE WHEN u.email = 'teacher@test.com' THEN 'teacher'::public.app_role
            ELSE 'student'::public.app_role END
FROM auth.users u
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles readable by authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;

CREATE POLICY "Profiles readable by authenticated"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.prevent_role_self_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role
     AND NOT public.is_teacher(auth.uid()) THEN
    RAISE EXCEPTION 'You cannot change your own role';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS prevent_profile_role_self_update ON public.profiles;
CREATE TRIGGER prevent_profile_role_self_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_update();

-- 7. Signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE assigned_role public.app_role;
BEGIN
  assigned_role := CASE WHEN NEW.email = 'teacher@test.com' THEN 'teacher'::public.app_role
                        ELSE 'student'::public.app_role END;
  INSERT INTO public.profiles (id, full_name, total_xp, current_level, daily_streak, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), 0, 1, 0, assigned_role::text)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Tasks RLS cleanup
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='Tasks' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public."Tasks"', pol.policyname);
  END LOOP;
END $$;
ALTER TABLE public."Tasks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks: authenticated can view"
  ON public."Tasks" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Tasks: users insert own"
  ON public."Tasks" FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Tasks: owner or teacher update"
  ON public."Tasks" FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_teacher(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_teacher(auth.uid()));
CREATE POLICY "Tasks: owner or teacher delete"
  ON public."Tasks" FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_teacher(auth.uid()));

-- 9. Clean submissions table
CREATE TABLE public.submissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id         uuid REFERENCES public."Tasks"(id) ON DELETE CASCADE,
  submission_text text,
  file_url        text,
  status          text NOT NULL DEFAULT 'pending',
  feedback        text,
  grade           numeric,
  awarded_xp      integer DEFAULT 0,
  grade_published boolean NOT NULL DEFAULT false,
  reviewed_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Submissions: students view own or teacher all"
  ON public.submissions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_teacher(auth.uid()));
CREATE POLICY "Submissions: students insert own"
  ON public.submissions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Submissions: own (pre-review) or teacher update"
  ON public.submissions FOR UPDATE TO authenticated
  USING ((user_id = auth.uid() AND reviewed_at IS NULL) OR public.is_teacher(auth.uid()))
  WITH CHECK ((user_id = auth.uid() AND reviewed_at IS NULL) OR public.is_teacher(auth.uid()));
CREATE POLICY "Submissions: teachers delete"
  ON public.submissions FOR DELETE TO authenticated
  USING (public.is_teacher(auth.uid()));

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER submissions_set_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 10. Notifications foundation
CREATE TABLE public.notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       text NOT NULL DEFAULT 'info',
  message    text NOT NULL,
  link       text,
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notifications: users view own"
  ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Notifications: users update own"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Notifications: users delete own"
  ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX notifications_user_unread_idx
  ON public.notifications (user_id, read, created_at DESC);

-- 11. Realtime (skip if already member)
DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public."Tasks"; EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions; EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.messages; EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END;
END $$;
