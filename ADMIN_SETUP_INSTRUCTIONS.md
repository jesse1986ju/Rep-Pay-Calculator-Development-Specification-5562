# 🚨 ADMIN LOGIN FIX - FOLLOW THESE STEPS

## Step 1: Create Admin User in Supabase Dashboard

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/azxbgnodeukavdrdyfrt
2. **Navigate to**: Authentication → Users
3. **Click "Add User"**
4. **Fill in these EXACT details**:
   ```
   Email: admin@engage.com
   Password: EngageAdmin2024!
   Email Confirm: UNCHECK (set to false)
   ```
5. **Click "Create User"**
6. **Copy the User ID** that appears (it will be a UUID like: 12345678-1234-1234-1234-123456789012)

## Step 2: Link Admin User to Our Database

After creating the auth user, run this SQL in your Supabase SQL Editor:

```sql
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from step 1
INSERT INTO users_rpc_x7k9m2 (id, email, name, role)
VALUES (
  'YOUR_USER_ID_HERE', -- Replace with the UUID from auth.users
  'admin@engage.com',
  'Admin User',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  name = 'Admin User',
  updated_at = NOW();
```

## Step 3: Verify Setup

Run this query to verify everything is working:

```sql
-- Verify admin user exists in both tables
SELECT 
  u.id, u.email, u.name, u.role,
  au.email as auth_email, au.email_confirmed_at
FROM users_rpc_x7k9m2 u
JOIN auth.users au ON u.id = au.id
WHERE u.role = 'admin';
```

## Step 4: Test Login

1. Go to: `/#/admin/login`
2. Use credentials:
   - **Email**: admin@engage.com
   - **Password**: EngageAdmin2024!

## ⚡ Quick Alternative Method

If you prefer to do it automatically, run this SQL after creating the auth user:

```sql
-- This will automatically link the auth user to our users table
INSERT INTO users_rpc_x7k9m2 (id, email, name, role)
SELECT au.id, au.email, 'Admin User', 'admin'
FROM auth.users au
WHERE au.email = 'admin@engage.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  name = 'Admin User',
  updated_at = NOW();
```

## 🔧 If Still Not Working

1. **Check Auth Settings**: Go to Authentication → Settings
   - Ensure "Enable email confirmations" is **DISABLED**
   - Ensure "Enable email change confirmations" is **DISABLED**

2. **Check Database Connection**: The error might be RLS policies. Run:
   ```sql
   -- Grant necessary permissions
   GRANT USAGE ON SCHEMA auth TO anon, authenticated;
   GRANT SELECT ON auth.users TO anon, authenticated;
   ```

3. **Check Browser Console**: Look for specific error messages

## 📋 Summary

The main issue is that Supabase Auth users must be created through the Dashboard (not SQL), then linked to our custom users table. Once you complete Step 1 and Step 2, the admin login should work perfectly.

## 🚨 Updated Credentials for Engage

| Field | Value |
|-------|-------|
| **Email** | admin@engage.com |
| **Password** | EngageAdmin2024! |
| **Role** | admin |
| **Login URL** | /#/admin/login |
| **Dashboard URL** | /#/admin |