# Admin User Setup Guide

## Step 1: Create Auth User in Supabase Dashboard

1. **Go to your Supabase Dashboard**: https://app.supabase.com
2. **Navigate to**: Authentication → Users
3. **Click "Add User"**
4. **Fill in these details**:
   ```
   Email: admin@brinks.com
   Password: BrinksAdmin2024!
   Confirm Password: BrinksAdmin2024!
   ```
5. **Click "Create User"**
6. **Copy the User ID** (UUID) that appears in the users list

## Step 2: Add User to Your Users Table

After creating the auth user, run this SQL in your Supabase SQL Editor:

```sql
-- Replace 'PASTE_USER_UUID_HERE' with the actual UUID from step 1
INSERT INTO users_rpc_x7k9m2 (id, email, name, role)
VALUES (
  'PASTE_USER_UUID_HERE',  -- Replace with the UUID from auth.users
  'admin@brinks.com',
  'Admin User',
  'admin'
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  name = 'Admin User';
```

## Step 3: Verify Admin User

Run this query to verify the admin user was created correctly:

```sql
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  au.email as auth_email
FROM users_rpc_x7k9m2 u
JOIN auth.users au ON u.id = au.id
WHERE u.role = 'admin';
```

## Step 4: Test Admin Login

1. **Go to your app**: Your app URL
2. **Navigate to**: `/#/admin/login`
3. **Login with**:
   - **Email**: `admin@brinks.com`
   - **Password**: `BrinksAdmin2024!`

## Alternative: Quick SQL Method

If you prefer, you can also find the user ID and update in one step:

```sql
-- First, find the user ID
SELECT id, email FROM auth.users WHERE email = 'admin@brinks.com';

-- Then use that ID to insert into your users table
-- (Replace the UUID below with the actual UUID from the query above)
INSERT INTO users_rpc_x7k9m2 (id, email, name, role)
SELECT id, email, 'Admin User', 'admin'
FROM auth.users 
WHERE email = 'admin@brinks.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  name = 'Admin User';
```

## Admin Credentials Summary

| Field | Value |
|-------|-------|
| **Email** | admin@brinks.com |
| **Password** | BrinksAdmin2024! |
| **Role** | admin |
| **Access URL** | /#/admin/login |

## Troubleshooting

If you encounter issues:

1. **User not found**: Make sure the auth user was created in Supabase Dashboard
2. **Permission denied**: Verify the user has 'admin' role in users_rpc_x7k9m2 table
3. **Login fails**: Check that email confirmation is disabled in Supabase Auth settings

## Security Note

After setting up, consider:
- Changing the default password
- Enabling MFA for admin accounts
- Creating additional admin users as needed