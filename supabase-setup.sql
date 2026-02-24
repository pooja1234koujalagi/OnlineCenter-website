-- ========================================
-- SUPABASE DATABASE SETUP SCRIPT
-- ========================================
-- Run this script in your Supabase SQL Editor

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create uploads table for file metadata
CREATE TABLE IF NOT EXISTS uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user VARCHAR(255) NOT NULL,
    userEmail VARCHAR(255) NOT NULL,
    filename VARCHAR(500) NOT NULL,
    originalname VARCHAR(500) NOT NULL,
    extraData TEXT,
    uploadedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create admin_info table for admin information
CREATE TABLE IF NOT EXISTS admin_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    callforms TEXT,
    required_documents TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_info ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for users table
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = 'customer');

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can insert their own profile (handled by auth trigger)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. Create RLS Policies for uploads table
-- Users can view their own uploads
CREATE POLICY "Users can view own uploads" ON uploads
    FOR SELECT USING (userEmail = auth.email());

-- Admins can view all uploads
CREATE POLICY "Admins can view all uploads" ON uploads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can insert their own uploads
CREATE POLICY "Users can insert own uploads" ON uploads
    FOR INSERT WITH CHECK (userEmail = auth.email());

-- Users can delete their own uploads
CREATE POLICY "Users can delete own uploads" ON uploads
    FOR DELETE USING (userEmail = auth.email());

-- Admins can delete any uploads
CREATE POLICY "Admins can delete any uploads" ON uploads
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 8. Create RLS Policies for admin_info table
-- Only admins can view admin info
CREATE POLICY "Only admins can view admin info" ON admin_info
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can insert admin info
CREATE POLICY "Only admins can insert admin info" ON admin_info
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can update admin info
CREATE POLICY "Only admins can update admin info" ON admin_info
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete admin info
CREATE POLICY "Only admins can delete admin info" ON admin_info
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 9. Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_info_updated_at BEFORE UPDATE ON admin_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        'customer'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_uploads_user_email ON uploads(userEmail);
CREATE INDEX IF NOT EXISTS idx_uploads_filename ON uploads(filename);
CREATE INDEX IF NOT EXISTS idx_uploads_uploaded_at ON uploads(uploadedAt);

-- 13. Insert default admin user (you need to manually set this user's role to 'admin' after first signup)
-- This is a placeholder - you'll need to create the first admin through the Supabase dashboard
-- or manually update their role after they register

-- 14. Create storage bucket for uploads (run this in Supabase Dashboard > Storage)
-- Bucket name: "uploads"
-- Make it private

-- 15. Storage policies (run these in Supabase Dashboard > Storage > Policies)
-- Users can upload files
-- INSERT: auth.role() = 'authenticated'
-- Users can view their own files (based on metadata)
-- SELECT: auth.email() = storage.foldername(name)[1]
-- Admins can view all files
-- SELECT: EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')

COMMIT;
