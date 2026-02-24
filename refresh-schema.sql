-- Refresh Supabase Schema Cache
-- Run this in Supabase SQL Editor to fix PGRST204 errors

-- Select from uploads table to refresh schema cache
SELECT * FROM uploads LIMIT 1;

-- Update table to ensure extraData column is recognized
ALTER TABLE uploads 
ALTER COLUMN extraData SET DATA TYPE TEXT;

-- Analyze table to refresh cache
ANALYZE uploads;
