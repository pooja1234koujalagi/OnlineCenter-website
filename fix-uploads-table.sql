-- ========================================
-- FIX UPLOADS TABLE SCHEMA
-- ========================================
-- Run this script in your Supabase SQL Editor

-- First, let's see what columns exist (you can run this separately)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'uploads';

-- Add the missing extraData column if it doesn't exist
ALTER TABLE uploads 
ADD COLUMN IF NOT EXISTS extraData TEXT;

-- Also make sure we have the correct column names
-- If you need to rename columns, uncomment these:

-- ALTER TABLE uploads RENAME COLUMN "user" TO "user";  -- if needed
-- ALTER TABLE uploads RENAME COLUMN userEmail TO "userEmail";  -- if needed
-- ALTER TABLE uploads RENAME COLUMN filename TO "filename";  -- if needed
-- ALTER TABLE uploads RENAME COLUMN originalname TO "originalname";  -- if needed
-- ALTER TABLE uploads RENAME COLUMN uploadedAt TO "uploadedAt";  -- if needed

-- Create/Update indexes
CREATE INDEX IF NOT EXISTS idx_uploads_user ON uploads("user");
CREATE INDEX IF NOT EXISTS idx_uploads_user_email ON uploads(userEmail);
CREATE INDEX IF NOT EXISTS idx_uploads_filename ON uploads(filename);
CREATE INDEX IF NOT EXISTS idx_uploads_uploaded_at ON uploads(uploadedAt);

COMMIT;
