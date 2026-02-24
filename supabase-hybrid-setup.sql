-- ========================================
-- SUPABASE HYBRID SETUP (Express + Supabase)
-- ========================================
-- Run this script in your Supabase SQL Editor

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create users table for Express sessions
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hashed passwords from Express
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

-- 5. Create password reset table
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    reset_otp VARCHAR(255) NOT NULL,
    otp_expire TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_uploads_user_email ON uploads(userEmail);
CREATE INDEX IF NOT EXISTS idx_uploads_filename ON uploads(filename);
CREATE INDEX IF NOT EXISTS idx_uploads_uploaded_at ON uploads(uploadedAt);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_otp ON password_resets(reset_otp);

-- 7. Create trigger to automatically update updated_at
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

-- 8. Insert a default admin user (optional - you can create via registration)
-- This is commented out - create your first admin through the registration form
-- then manually update their role to 'admin' in the Supabase dashboard

-- 9. Storage bucket setup (run in Supabase Dashboard > Storage)
-- Create bucket named "uploads" (public for Express server access)

COMMIT;
