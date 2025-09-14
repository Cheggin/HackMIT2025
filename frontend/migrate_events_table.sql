-- SQL Migration Script: Move events table from private to public schema
-- Run this in your Supabase SQL Editor

-- Step 1: Create the events table in public schema with the same structure
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
ON CONFLICT (id) DO NOTHING;  -- Prevents duplicate key errors if some data already exists

-- Step 3: Verify the data was copied correctly
-- Check row counts match
DO $$
DECLARE
  private_count INTEGER;
  public_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO private_count FROM private.events;
  SELECT COUNT(*) INTO public_count FROM public.events;

  RAISE NOTICE 'Private schema events count: %', private_count;
  RAISE NOTICE 'Public schema events count: %', public_count;

  IF private_count != public_count THEN
    RAISE WARNING 'Row counts do not match! Private: %, Public: %', private_count, public_count;
  ELSE
    RAISE NOTICE 'Migration successful! All % rows copied.', public_count;
  END IF;
END $$;

-- Step 4: (Optional) Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_time ON public.events(time);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(type);
CREATE INDEX IF NOT EXISTS idx_events_properties_step ON public.events((properties->>'step'));

-- Step 5: (Optional) Enable Row Level Security if needed
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow read access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access" ON public.events
  FOR SELECT
  USING (true);

-- Step 6: (Optional) If you want to enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;

-- Step 7: (CAREFUL!) Once you've verified everything works, you can drop the old table
-- ONLY RUN THIS AFTER CONFIRMING THE MIGRATION IS SUCCESSFUL
-- DROP TABLE private.events;

-- Alternative safer approach: Rename instead of dropping
-- ALTER TABLE private.events RENAME TO events_backup;

-- To check if real-time is enabled for the table:
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'events';