-- Campus Issue Management System - Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Core Identities)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('STUDENT', 'ADMIN', 'MAINTENANCE', 'FACULTY')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Students Table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    roll_number VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100),
    year INTEGER,
    rating INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Maintenance Staff Table
CREATE TABLE maintenance_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_code VARCHAR(100),
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Complaints Table
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    zone VARCHAR(100) NOT NULL,
    building VARCHAR(100),
    floor VARCHAR(50),
    room VARCHAR(100),
    severity VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    priority_score INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PENDING_REVIEW' NOT NULL,
    assigned_department_code VARCHAR(100),
    assigned_staff_id UUID REFERENCES maintenance_staff(id) ON DELETE SET NULL,
    reporter_student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_emergency BOOLEAN DEFAULT FALSE,
    upvote_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    sla_deadline TIMESTAMP WITH TIME ZONE,
    sla_breached BOOLEAN DEFAULT FALSE,
    routing_confidence FLOAT,
    routing_reason TEXT,
    gps_lat DOUBLE PRECISION,
    gps_lng DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Complaint Media Table
CREATE TABLE complaint_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    media_type VARCHAR(50) NOT NULL, -- 'IMAGE' or 'VIDEO'
    is_before BOOLEAN DEFAULT TRUE,
    is_after BOOLEAN DEFAULT FALSE,
    uploaded_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Complaint Votes Table
CREATE TABLE complaint_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(complaint_id, student_id)
);

-- 7. Complaint Comments Table
CREATE TABLE complaint_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    author_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_official BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Complaint Updates Table (Timeline)
CREATE TABLE complaint_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    note TEXT,
    posted_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to automatically update updated_at in complaints
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_complaints_modtime
    BEFORE UPDATE ON complaints
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Row Level Security (RLS) - Set basic policies (Modify as needed)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_updates ENABLE ROW LEVEL SECURITY;

-- Simple policies allowing reads
CREATE POLICY "Public profiles are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "All complaints are viewable" ON complaints FOR SELECT USING (true);
CREATE POLICY "Allow all operations for now (DEV ONLY)" ON complaints FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on votes" ON complaint_votes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on comments" ON complaint_comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on updates" ON complaint_updates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on media" ON complaint_media FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Insert a default Admin for testing (Password: password123)
INSERT INTO users (id, email, name, password_hash, role, is_active)
VALUES (
    uuid_generate_v4(),
    'admin@nitj.ac.in',
    'System Admin',
    '$2a$10$wK1m.XgU.dXXo4G2H/bFMOyZ7K/62fP3d1Lh4bA2d5t9j.Xz2e3B.', -- Hash for 'password123'
    'ADMIN',
    TRUE
);

-- Insert a default Student for testing (Password: password123)
INSERT INTO users (id, email, name, password_hash, role, is_active)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'student@nitj.ac.in',
    'John Doe',
    '$2a$10$wK1m.XgU.dXXo4G2H/bFMOyZ7K/62fP3d1Lh4bA2d5t9j.Xz2e3B.',
    'STUDENT',
    TRUE
);

INSERT INTO students (user_id, roll_number, department, year)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    '12345678',
    'Computer Science',
    3
);
