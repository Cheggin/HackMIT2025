-- Copy all rows from private.events to public.events
-- Run this in your Supabase SQL Editor

-- Step 1: Create the events table in public schema if it doesn't exist
CREATE TABLE IF NOT EXISTS public.events (
  id BIGINT PRIMARY KEY,
  type TEXT,
  properties JSONB,
  time BIGINT
);

-- Step 2: Copy all data from private.events to public.events
INSERT INTO public.events (id, type, properties, time)
SELECT id, type, properties, time
FROM private.events
ON CONFLICT (id) DO NOTHING;  -- Skip if row already exists

-- Step 3: Verify the copy was successful
SELECT
  (SELECT COUNT(*) FROM private.events) as private_count,
  (SELECT COUNT(*) FROM public.events) as public_count;

-- Optional: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_public_events_time ON public.events(time);
CREATE INDEX IF NOT EXISTS idx_public_events_type ON public.events(type);