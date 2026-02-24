-- ========================================
-- SUPABASE STORAGE POLICIES
-- ========================================
-- Run these policies in Supabase Dashboard > Storage > Policies
-- Bucket name: "uploads"

-- 1. Users can upload files to their own folder
-- Policy Name: "Users can upload files"
-- Bucket: uploads
-- Operation: INSERT
-- Policy Definition:
auth.role() = 'authenticated'

-- 2. Users can view their own files
-- Policy Name: "Users can view own files"
-- Bucket: uploads
-- Operation: SELECT
-- Policy Definition:
auth.email() = (storage.foldername(name))[1]

-- 3. Admins can view all files
-- Policy Name: "Admins can view all files"
-- Bucket: uploads
-- Operation: SELECT
-- Policy Definition:
EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
)

-- 4. Users can update their own files
-- Policy Name: "Users can update own files"
-- Bucket: uploads
-- Operation: UPDATE
-- Policy Definition:
auth.email() = (storage.foldername(name))[1]

-- 5. Users can delete their own files
-- Policy Name: "Users can delete own files"
-- Bucket: uploads
-- Operation: DELETE
-- Policy Definition:
auth.email() = (storage.foldername(name))[1]

-- 6. Admins can delete any files
-- Policy Name: "Admins can delete any files"
-- Bucket: uploads
-- Operation: DELETE
-- Policy Definition:
EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
)

-- ========================================
-- ALTERNATIVE APPROACH: Using file metadata
-- ========================================
-- If you prefer to store user email in file metadata instead of folder structure:

-- 1. Users can upload files with their email in metadata
-- Policy Name: "Users can upload files with metadata"
-- Bucket: uploads
-- Operation: INSERT
-- Policy Definition:
auth.role() = 'authenticated' AND 
storage.metadata['userEmail'] = auth.email()

-- 2. Users can view files with their email in metadata
-- Policy Name: "Users can view files by metadata"
-- Bucket: uploads
-- Operation: SELECT
-- Policy Definition:
storage.metadata['userEmail'] = auth.email()

-- 3. Admins can view all files
-- Policy Name: "Admins can view all files by metadata"
-- Bucket: uploads
-- Operation: SELECT
-- Policy Definition:
EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
)

-- 4. Users can delete files with their email in metadata
-- Policy Name: "Users can delete files by metadata"
-- Bucket: uploads
-- Operation: DELETE
-- Policy Definition:
storage.metadata['userEmail'] = auth.email()

-- 5. Admins can delete any files
-- Policy Name: "Admins can delete any files by metadata"
-- Bucket: uploads
-- Operation: DELETE
-- Policy Definition:
EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
)
