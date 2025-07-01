-- Create admin user in the users table
-- First, get the user ID from auth.users (replace with actual UUID from dashboard)
-- You'll need to replace 'YOUR_USER_UUID_HERE' with the actual UUID from the auth.users table

-- Insert admin user into your users table
INSERT INTO users_rpc_x7k9m2 (id, email, name, role)
VALUES (
  'YOUR_USER_UUID_HERE', -- Replace with UUID from auth.users
  'admin@brinks.com',
  'Admin User',
  'admin'
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  name = 'Admin User';

-- Alternative: If you know the email, you can find the UUID like this:
-- SELECT id, email FROM auth.users WHERE email = 'admin@brinks.com';