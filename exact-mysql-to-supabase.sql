-- ========================================
-- EXACT MYSQL TO SUPABASE CONVERSION
-- Keeping exact table and column names
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables
DROP TABLE IF EXISTS admin_info;
DROP TABLE IF EXISTS uploads;
DROP TABLE IF EXISTS users;

-- Create users table (exact MySQL structure + UUID)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(255),
    mobile VARCHAR(20),
    role VARCHAR(20),
    reset_otp VARCHAR(255),
    otp_expire TIMESTAMP WITH TIME ZONE,
    otp_attempts INTEGER DEFAULT 0
);

-- Create uploads table (exact MySQL structure + UUID)
CREATE TABLE uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user" VARCHAR(100),  -- Using quotes for reserved keyword
    userEmail VARCHAR(100),
    filename VARCHAR(255),
    originalname VARCHAR(255),
    extraData TEXT,
    uploadedAt TIMESTAMP WITH TIME ZONE
);

-- Create admin_info table (exact MySQL structure + UUID)
CREATE TABLE admin_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    callforms TEXT NOT NULL,
    required_documents TEXT NOT NULL
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_uploads_user ON uploads("user");
CREATE INDEX idx_uploads_user_email ON uploads(userEmail);
CREATE INDEX idx_uploads_filename ON uploads(filename);
CREATE INDEX idx_uploads_uploaded_at ON uploads(uploadedAt);

-- Add unique constraint on email
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Disable RLS for Express hybrid setup
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE uploads DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_info DISABLE ROW LEVEL SECURITY;

COMMIT;
