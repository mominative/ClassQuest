
-- =============================================
-- 1. Tasks table: owner-scoped CRUD policies
-- =============================================
CREATE POLICY "Users can view own tasks"
ON "Tasks" FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
ON "Tasks" FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
ON "Tasks" FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
ON "Tasks" FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =============================================
-- 2. Users table: read all (leaderboard), write own, block role changes
-- =============================================
CREATE POLICY "Anyone authenticated can view users"
ON "Users" FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert own record"
ON "Users" FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own record"
ON "Users" FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Trigger to prevent users from changing their own role
CREATE OR REPLACE FUNCTION prevent_role_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'You cannot change your own role';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_role_change
BEFORE UPDATE ON "Users"
FOR EACH ROW
EXECUTE FUNCTION prevent_role_self_update();

-- =============================================
-- 3. Roles table: read-only for authenticated users
-- =============================================
CREATE POLICY "Authenticated users can read roles"
ON "Roles" FOR SELECT
TO authenticated
USING (true);
