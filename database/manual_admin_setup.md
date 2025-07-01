# Manual Admin User Setup

## ✅ **STEP 1: Create Auth User in Supabase Dashboard**

1. **Go to your Supabase Dashboard**: https://app.supabase.com/project/azxbgnodeukavdrdyfrt
2. **Navigate to**: Authentication → Users
3. **Click "Add User"**
4. **Fill in these details**:
   ```
   Email: admin@brinks.com
   Password: BrinksAdmin2024!
   Email Confirm: false (uncheck this)
   ```
5. **Click "Create User"**
6. **Copy the User ID (UUID)** that appears in the users list

## ✅ **STEP 2: Add User to Your Users Table**

Go to **SQL Editor** in your Supabase dashboard and run:

```sql
-- Method 1: If you have the UUID from step 1
INSERT INTO users_rpc_x7k9m2 (id, email, name, role)
VALUES (
  'PASTE_YOUR_UUID_HERE',  -- Replace with actual UUID from auth.users
  'admin@brinks.com',
  'Admin User',
  'admin'
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  name = 'Admin User',
  updated_at = NOW();
```

**OR use this automated method:**

```sql
-- Method 2: Automatic lookup and insert
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
```

## ✅ **STEP 3: Verify Setup**

Run this query to confirm everything is working:

```sql
-- Verify admin user exists
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.created_at,
  au.email as auth_email,
  au.email_confirmed_at
FROM users_rpc_x7k9m2 u
JOIN auth.users au ON u.id = au.id
WHERE u.role = 'admin';
```

## ✅ **STEP 4: Test Login**

1. **Go to your app admin login**: `/#/admin/login`
2. **Login with**:
   - **Email**: `admin@brinks.com`
   - **Password**: `BrinksAdmin2024!`

## 🚨 **Important Notes**

- **Email Confirmation**: Make sure to **uncheck** email confirmation when creating the user
- **Password**: Use exactly `BrinksAdmin2024!`
- **Role**: Must be set to `admin` in the users_rpc_x7k9m2 table

## 🔧 **Troubleshooting**

If login fails:

1. **Check Auth Settings**: Go to Authentication → Settings → Email Auth
   - Ensure "Enable email confirmations" is **disabled**
   
2. **Verify User Exists**: Run this query:
   ```sql
   SELECT email, email_confirmed_at FROM auth.users WHERE email = 'admin@brinks.com';
   ```

3. **Check User Role**: Run this query:
   ```sql
   SELECT email, role FROM users_rpc_x7k9m2 WHERE email = 'admin@brinks.com';
   ```

## 📋 **Admin Credentials Summary**

| Field | Value |
|-------|-------|
| **Email** | admin@brinks.com |
| **Password** | BrinksAdmin2024! |
| **Role** | admin |
| **Login URL** | /#/admin/login |
| **Dashboard URL** | /#/admin |