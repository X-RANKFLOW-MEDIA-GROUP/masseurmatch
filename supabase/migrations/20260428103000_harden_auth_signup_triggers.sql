-- Harden Supabase auth signup triggers so auth.users inserts never fail because
-- public mirror/profile tables are missing columns, constraints drifted, or older
-- triggers are still attached to auth.users.
--
-- This migration fixes the production symptom:
--   "Database error creating new user"
--
-- Principle:
-- Auth user creation must always win. Public profile/user mirrors are best effort.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result boolean := false;
BEGIN
  IF to_regclass('public.users') IS NULL THEN
    RETURN false;
  END IF;

  EXECUTE 'SELECT COALESCE((SELECT role = ''admin'' FROM public.users WHERE id = auth.uid()), false)'
  INTO result;

  RETURN COALESCE(result, false);
EXCEPTION
  WHEN undefined_table OR undefined_column OR insufficient_privilege THEN
    RETURN false;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;

CREATE OR REPLACE FUNCTION public.mm_column_exists(target_table text, target_column text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = target_table
      AND column_name = target_column
  );
$$;

CREATE OR REPLACE FUNCTION public.mm_constraint_allows(table_name text, column_name text, value_to_check text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  constraint_text text;
BEGIN
  SELECT pg_get_constraintdef(c.oid)
  INTO constraint_text
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE n.nspname = 'public'
    AND t.relname = table_name
    AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) ILIKE '%' || column_name || '%'
  LIMIT 1;

  IF constraint_text IS NULL THEN
    RETURN true;
  END IF;

  RETURN constraint_text ILIKE '%' || value_to_check || '%';
EXCEPTION
  WHEN OTHERS THEN
    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.mm_sync_auth_user_best_effort()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  display_name text;
  users_role text;
  user_roles_role text;
  profile_status text;
  insert_columns text[] := ARRAY[]::text[];
  insert_values text[] := ARRAY[]::text[];
  update_sets text[] := ARRAY[]::text[];
BEGIN
  display_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    'Therapist'
  );

  users_role := CASE
    WHEN public.mm_constraint_allows('users', 'role', 'therapist') THEN 'therapist'
    WHEN public.mm_constraint_allows('users', 'role', 'provider') THEN 'provider'
    ELSE 'therapist'
  END;

  user_roles_role := CASE
    WHEN public.mm_constraint_allows('user_roles', 'role', 'provider') THEN 'provider'
    WHEN public.mm_constraint_allows('user_roles', 'role', 'therapist') THEN 'therapist'
    ELSE 'provider'
  END;

  profile_status := CASE
    WHEN public.mm_constraint_allows('profiles', 'status', 'pending') THEN 'pending'
    WHEN public.mm_constraint_allows('profiles', 'status', 'draft') THEN 'draft'
    WHEN public.mm_constraint_allows('profiles', 'status', 'pending_approval') THEN 'pending_approval'
    ELSE 'pending'
  END;

  BEGIN
    IF to_regclass('public.users') IS NOT NULL THEN
      insert_columns := ARRAY['id'];
      insert_values := ARRAY['$1'];
      update_sets := ARRAY[]::text[];

      IF public.mm_column_exists('users', 'email') THEN
        insert_columns := insert_columns || 'email';
        insert_values := insert_values || '$2';
        update_sets := update_sets || 'email = EXCLUDED.email';
      END IF;

      IF public.mm_column_exists('users', 'full_name') THEN
        insert_columns := insert_columns || 'full_name';
        insert_values := insert_values || '$3';
        update_sets := update_sets || 'full_name = EXCLUDED.full_name';
      END IF;

      IF public.mm_column_exists('users', 'role') THEN
        insert_columns := insert_columns || 'role';
        insert_values := insert_values || '$4';
        update_sets := update_sets || 'role = EXCLUDED.role';
      END IF;

      EXECUTE format(
        'INSERT INTO public.users (%s) VALUES (%s) ON CONFLICT (id) DO UPDATE SET %s',
        array_to_string(insert_columns, ', '),
        array_to_string(insert_values, ', '),
        COALESCE(NULLIF(array_to_string(update_sets, ', '), ''), 'id = EXCLUDED.id')
      )
      USING NEW.id, NEW.email, display_name, users_role;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'MasseurMatch auth mirror users sync skipped: %', SQLERRM;
  END;

  BEGIN
    IF to_regclass('public.profiles') IS NOT NULL AND public.mm_column_exists('profiles', 'user_id') THEN
      insert_columns := ARRAY['user_id'];
      insert_values := ARRAY['$1'];

      IF public.mm_column_exists('profiles', 'email') THEN
        insert_columns := insert_columns || 'email';
        insert_values := insert_values || '$2';
      END IF;

      IF public.mm_column_exists('profiles', 'full_name') THEN
        insert_columns := insert_columns || 'full_name';
        insert_values := insert_values || '$3';
      END IF;

      IF public.mm_column_exists('profiles', 'display_name') THEN
        insert_columns := insert_columns || 'display_name';
        insert_values := insert_values || '$3';
      END IF;

      IF public.mm_column_exists('profiles', 'status') THEN
        insert_columns := insert_columns || 'status';
        insert_values := insert_values || '$4';
      END IF;

      IF public.mm_column_exists('profiles', '_tier') THEN
        insert_columns := insert_columns || '_tier';
        insert_values := insert_values || '''free''';
      END IF;

      IF public.mm_column_exists('profiles', 'subscription_tier') THEN
        insert_columns := insert_columns || 'subscription_tier';
        insert_values := insert_values || '''free''';
      END IF;

      IF public.mm_column_exists('profiles', 'is_active') THEN
        insert_columns := insert_columns || 'is_active';
        insert_values := insert_values || 'false';
      END IF;

      EXECUTE format(
        'INSERT INTO public.profiles (%s) VALUES (%s) ON CONFLICT (user_id) DO NOTHING',
        array_to_string(insert_columns, ', '),
        array_to_string(insert_values, ', ')
      )
      USING NEW.id, NEW.email, display_name, profile_status;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'MasseurMatch auth profile sync skipped: %', SQLERRM;
  END;

  BEGIN
    IF to_regclass('public.user_roles') IS NOT NULL AND public.mm_column_exists('user_roles', 'user_id') THEN
      IF public.mm_column_exists('user_roles', 'role') THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, user_roles_role)
        ON CONFLICT DO NOTHING;
      ELSE
        INSERT INTO public.user_roles (user_id)
        VALUES (NEW.id)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'MasseurMatch auth role sync skipped: %', SQLERRM;
  END;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'MasseurMatch auth signup trigger ignored error: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.mm_sync_auth_user_best_effort();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.mm_sync_auth_user_best_effort();
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.mm_sync_auth_user_best_effort();
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.mm_sync_auth_user_best_effort();
END;
$$;
