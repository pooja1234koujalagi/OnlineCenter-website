-- ========================================
-- EXACT SUPABASE SETUP (Based on MySQL Structure)
-- ========================================
-- Run this script in your Supabase SQL Editor

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create users table (exact match to MySQL structure)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(255),
    mobile VARCHAR(20),
    role VARCHAR(20),
    reset_otp VARCHAR(255),
    otp_expire TIMESTAMP WITH TIME ZONE,
    otp_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create uploads table (exact match to MySQL structure)
CREATE TABLE IF NOT EXISTS uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user" VARCHAR(100), -- Using quotes to avoid reserved keyword issue
    userEmail VARCHAR(100),
    filename VARCHAR(255),
    originalname VARCHAR(255),
    extraData TEXT,
    uploadedAt TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create admin_info table (exact match to MySQL structure)
CREATE TABLE IF NOT EXISTS admin_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    callforms TEXT NOT NULL,
    required_documents TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_uploads_user ON uploads("user");
CREATE INDEX IF NOT EXISTS idx_uploads_user_email ON uploads(userEmail);
CREATE INDEX IF NOT EXISTS idx_uploads_filename ON uploads(filename);
CREATE INDEX IF NOT EXISTS idx_uploads_uploaded_at ON uploads(uploadedAt);

-- 6. Create unique constraint on email
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

COMMIT;
