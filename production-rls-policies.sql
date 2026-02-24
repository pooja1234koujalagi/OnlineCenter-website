-- ========================================
-- PRODUCTION RLS POLICIES
-- Secure Row Level Security for Serverless App
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_info ENABLE ROW LEVEL SECURITY;

-- ========================================
-- USERS TABLE POLICIES
-- ========================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- ========================================
-- UPLOADS TABLE POLICIES
-- ========================================

-- Users can view their own uploads
CREATE POLICY "Users can view own uploads" ON uploads
    FOR SELECT USING (auth.uid()::text = (
        SELECT useremail FROM uploads WHERE id = uploads.id LIMIT 1
    ));

-- Users can insert their own uploads
CREATE POLICY "Users can insert own uploads" ON uploads
    FOR INSERT WITH CHECK (auth.uid()::text = useremail);

-- Users can update their own uploads
CREATE POLICY "Users can update own uploads" ON uploads
    FOR UPDATE USING (auth.uid()::text = (
        SELECT useremail FROM uploads WHERE id = uploads.id LIMIT 1
    ));

-- Users can delete their own uploads
CREATE POLICY "Users can delete own uploads" ON uploads
    FOR DELETE USING (auth.uid()::text = (
        SELECT useremail FROM uploads WHERE id = uploads.id LIMIT 1
    ));

-- Admins can access all uploads
CREATE POLICY "Admins can access all uploads" ON uploads
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================
-- ADMIN_INFO TABLE POLICIES
-- ========================================

-- Only admins can access admin_info
CREATE POLICY "Admins can manage admin_info" ON admin_info
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================
-- STORAGE POLICIES
-- ========================================

-- Users can access their own folder
CREATE POLICY "Users can access own folder" ON storage.objects
    FOR ALL USING (
        bucket_id = 'uploads' AND 
        auth.uid()::text = (
            SELECT split_part(name, '/', 1) FROM storage.objects 
            WHERE id = (SELECT id FROM storage.objects WHERE name = storage.objects.name LIMIT 1)
        )
    );

-- Admins can access all files
CREATE POLICY "Admins can access all uploads" ON storage.objects
    FOR ALL USING (
        bucket_id = 'uploads' AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_uploads_user_email ON uploads(useremail);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_uploads_filename ON uploads(filename);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_uploads_uploaded_at ON uploads(uploadedat);

COMMIT;
