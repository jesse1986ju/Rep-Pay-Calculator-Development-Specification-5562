-- Quick Admin User Setup SQL
-- Run this in Supabase SQL Editor AFTER creating the auth user in the dashboard

-- Step 1: Create auth user in dashboard first with:
-- Email: admin@brinks.com
-- Password: BrinksAdmin2024!
-- Email Confirm: false

-- Step 2: Run this SQL to automatically add to users table
INSERT INTO users_rpc_x7k9m2 (id, email, name, role)
SELECT 
  au.id,
  au.email,
  'Admin User',
  'admin'
FROM auth.users au
WHERE au.email = 'admin@brinks.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  name = 'Admin User',
  updated_at = NOW();

-- Step 3: Verify the setup
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.created_at,
  au.email_confirmed_at
FROM users_rpc_x7k9m2 u
JOIN auth.users au ON u.id = au.id
WHERE u.role = 'admin';

-- If you need to check auth settings, run:
-- SELECT * FROM auth.users WHERE email = 'admin@brinks.com';