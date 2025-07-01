-- Admin User Creation Script
-- Run this AFTER creating the auth user in Supabase Dashboard

-- Step 1: Create the auth user in Supabase Dashboard first
-- Email: admin@brinks.com
-- Password: BrinksAdmin2024!

-- Step 2: Run this SQL to add the user to your users table
-- Replace 'YOUR_ADMIN_USER_UUID' with the actual UUID from auth.users

INSERT INTO users_rpc_x7k9m2 (id, email, name, role)
VALUES (
  'YOUR_ADMIN_USER_UUID',  -- Replace with actual UUID from auth.users
  'admin@brinks.com',
  'Admin User',
  'admin'
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  name = 'Admin User',
  updated_at = NOW();

-- Alternative method: Use this if you want to find and insert in one step
-- (Run this AFTER creating the auth user)
INSERT INTO users_rpc_x7k9m2 (id, email, name, role)
SELECT 
  id, 
  email, 
  'Admin User', 
  'admin'
FROM auth.users 
WHERE email = 'admin@brinks.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  name = 'Admin User',
  updated_at = NOW();

-- Verification query - run this to confirm admin user exists
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.created_at,
  au.email as auth_email,
  au.created_at as auth_created_at
FROM users_rpc_x7k9m2 u
JOIN auth.users au ON u.id = au.id
WHERE u.role = 'admin'
ORDER BY u.created_at DESC;