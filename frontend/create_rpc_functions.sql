-- SQL Functions to access private.events table through public schema
-- Run this in your Supabase SQL Editor

-- Function to get initial events
CREATE OR REPLACE FUNCTION public.get_events(
  limit_count INT DEFAULT 50,
  order_desc BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
  id BIGINT,
  type TEXT,
  properties JSONB,
  time BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to access private schema
SET search_path = public
AS $$
BEGIN
  IF order_desc THEN
    RETURN QUERY
    SELECT e.id, e.type, e.properties, e.time
    FROM private.events e
    ORDER BY e.time DESC
    LIMIT limit_count;
  ELSE
    RETURN QUERY
    SELECT e.id, e.type, e.properties, e.time
    FROM private.events e
    ORDER BY e.time ASC
    LIMIT limit_count;
  END IF;
END;
$$;

-- Function to get new events after a timestamp
CREATE OR REPLACE FUNCTION public.get_new_events(
  after_time BIGINT,
  limit_count INT DEFAULT 10
)
RETURNS TABLE (
  id BIGINT,
  type TEXT,
  properties JSONB,
  time BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.type, e.properties, e.time
  FROM private.events e
  WHERE e.time > after_time
  ORDER BY e.time ASC
  LIMIT limit_count;
END;
$$;

-- Function to test connection (get single event)
CREATE OR REPLACE FUNCTION public.test_events_connection()
RETURNS TABLE (
  id BIGINT,
  has_data BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id BIGINT;
BEGIN
  SELECT e.id INTO event_id
  FROM private.events e
  LIMIT 1;

  IF event_id IS NOT NULL THEN
    RETURN QUERY SELECT event_id, true;
  ELSE
    RETURN QUERY SELECT 0::BIGINT, false;
  END IF;
END;
$$;

-- Grant execute permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_events TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_new_events TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.test_events_connection TO anon, authenticated;

-- Test the functions
SELECT * FROM public.test_events_connection();
SELECT * FROM public.get_events(5, true);

-- =============================================================
-- Generic SQL runner used by the frontend to execute graph SQL
-- WARNING: This uses dynamic SQL. Keep it in the public schema
-- and ensure only safe, read-only queries are used.
-- =============================================================

CREATE OR REPLACE FUNCTION public.sql(
  modifiedquery TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Wrap incoming SELECT in a subquery and aggregate rows as JSONB array
  EXECUTE format('SELECT COALESCE(jsonb_agg(t), ''[]''::jsonb) FROM (%s) t', modifiedquery)
  INTO result;
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.sql(TEXT) TO anon, authenticated;