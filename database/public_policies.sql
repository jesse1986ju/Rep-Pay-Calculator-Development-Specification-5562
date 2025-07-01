-- Update RLS policies to allow public access to calculator data
-- Run this in your Supabase SQL Editor after the main schema

-- Allow public read access to multipliers
DROP POLICY IF EXISTS "All authenticated users can read multipliers" ON multipliers_rpc_x7k9m2;
CREATE POLICY "Public read access to multipliers" ON multipliers_rpc_x7k9m2
  FOR SELECT USING (true);

-- Allow public read access to base packages
DROP POLICY IF EXISTS "All authenticated users can read base packages" ON base_packages_rpc_x7k9m2;
CREATE POLICY "Public read access to base packages" ON base_packages_rpc_x7k9m2
  FOR SELECT USING (true);

-- Allow public read access to equipment addons
DROP POLICY IF EXISTS "All authenticated users can read equipment addons" ON equipment_addons_rpc_x7k9m2;
CREATE POLICY "Public read access to equipment addons" ON equipment_addons_rpc_x7k9m2
  FOR SELECT USING (true);

-- Allow public read access to settings
DROP POLICY IF EXISTS "All authenticated users can read settings" ON settings_rpc_x7k9m2;
CREATE POLICY "Public read access to settings" ON settings_rpc_x7k9m2
  FOR SELECT USING (true);

-- Keep admin-only policies for modifications
CREATE POLICY "Only admins can modify multipliers" ON multipliers_rpc_x7k9m2
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_rpc_x7k9m2 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can modify base packages" ON base_packages_rpc_x7k9m2
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_rpc_x7k9m2 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can modify equipment addons" ON equipment_addons_rpc_x7k9m2
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_rpc_x7k9m2 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );