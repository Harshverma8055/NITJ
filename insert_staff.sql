-- Create Default Maintenance Staff Accounts

-- 1. IT / Network Staff
INSERT INTO users (id, email, name, password_hash, role, is_active) 
VALUES ('c1a5b8f1-8d9e-4c7a-b6d3-9e2f1a5c8b7d', 'staff.it@nitj.ac.in', 'Rajesh Kumar (IT Support)', '$2a$10$wK1m.XgU.dXXo4G2H/bFMOyZ7K/62fP3d1Lh4bA2d5t9j.Xz2e3B.', 'MAINTENANCE', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO maintenance_staff (user_id, department_code, department)
VALUES ('c1a5b8f1-8d9e-4c7a-b6d3-9e2f1a5c8b7d', 'IT_INFRASTRUCTURE', 'IT & Network')
ON CONFLICT DO NOTHING;

-- 2. Electrical Staff
INSERT INTO users (id, email, name, password_hash, role, is_active) 
VALUES ('d2b6c9f2-9e0f-5d8b-c7e4-0f3a2b6d9c8e', 'staff.electrical@nitj.ac.in', 'Amit Singh (Electrical)', '$2a$10$wK1m.XgU.dXXo4G2H/bFMOyZ7K/62fP3d1Lh4bA2d5t9j.Xz2e3B.', 'MAINTENANCE', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO maintenance_staff (user_id, department_code, department)
VALUES ('d2b6c9f2-9e0f-5d8b-c7e4-0f3a2b6d9c8e', 'ELECTRICAL', 'Electrical & AC')
ON CONFLICT DO NOTHING;

-- 3. Plumbing / Civil Staff
INSERT INTO users (id, email, name, password_hash, role, is_active) 
VALUES ('e3c7d0f3-0f1a-6e9c-d8f5-1a4b3c7e0d9f', 'staff.plumbing@nitj.ac.in', 'Suresh Patel (Plumbing)', '$2a$10$wK1m.XgU.dXXo4G2H/bFMOyZ7K/62fP3d1Lh4bA2d5t9j.Xz2e3B.', 'MAINTENANCE', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO maintenance_staff (user_id, department_code, department)
VALUES ('e3c7d0f3-0f1a-6e9c-d8f5-1a4b3c7e0d9f', 'PLUMBING', 'Plumbing & Washrooms')
ON CONFLICT DO NOTHING;

-- 4. Hostel Staff
INSERT INTO users (id, email, name, password_hash, role, is_active) 
VALUES ('f4e8d1a2-1e2b-7f8c-e9a0-2b5c4d8e1f0b', 'staff.hostel@nitj.ac.in', 'Prakash Sharma (Hostel Manager)', '$2a$10$wK1m.XgU.dXXo4G2H/bFMOyZ7K/62fP3d1Lh4bA2d5t9j.Xz2e3B.', 'MAINTENANCE', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO maintenance_staff (user_id, department_code, department)
VALUES ('f4e8d1a2-1e2b-7f8c-e9a0-2b5c4d8e1f0b', 'HOSTEL_MAINT', 'Hostel Maintenance')
ON CONFLICT DO NOTHING;
