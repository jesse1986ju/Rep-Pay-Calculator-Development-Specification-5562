-- Rep Pay Calculator Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users_rpc_x7k9m2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('rep', 'manager', 'admin')),
  state TEXT,
  manager_id UUID REFERENCES users_rpc_x7k9m2(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security for users
ALTER TABLE users_rpc_x7k9m2 ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view their own profile" ON users_rpc_x7k9m2
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users_rpc_x7k9m2
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users_rpc_x7k9m2
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_rpc_x7k9m2 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert users" ON users_rpc_x7k9m2
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_rpc_x7k9m2 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Multipliers table
CREATE TABLE IF NOT EXISTS multipliers_rpc_x7k9m2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grade TEXT NOT NULL CHECK (grade IN ('A', 'A-', 'B+', 'B', 'B-', 'C')),
  value DECIMAL(5,2) NOT NULL CHECK (value >= 0),
  state TEXT,
  manager_id UUID REFERENCES users_rpc_x7k9m2(id),
  rep_id UUID REFERENCES users_rpc_x7k9m2(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security for multipliers
ALTER TABLE multipliers_rpc_x7k9m2 ENABLE ROW LEVEL SECURITY;

-- Policies for multipliers
CREATE POLICY "All authenticated users can read multipliers" ON multipliers_rpc_x7k9m2
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and managers can manage multipliers" ON multipliers_rpc_x7k9m2
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_rpc_x7k9m2 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Base packages table
CREATE TABLE IF NOT EXISTS base_packages_rpc_x7k9m2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  equipment_cost DECIMAL(10,2) NOT NULL CHECK (equipment_cost >= 0),
  install_fee DECIMAL(10,2) NOT NULL CHECK (install_fee >= 0),
  activation_fee DECIMAL(10,2) NOT NULL CHECK (activation_fee >= 0),
  state TEXT,
  manager_id UUID REFERENCES users_rpc_x7k9m2(id),
  rep_id UUID REFERENCES users_rpc_x7k9m2(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security for base packages
ALTER TABLE base_packages_rpc_x7k9m2 ENABLE ROW LEVEL SECURITY;

-- Policies for base packages
CREATE POLICY "All authenticated users can read base packages" ON base_packages_rpc_x7k9m2
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and managers can manage base packages" ON base_packages_rpc_x7k9m2
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_rpc_x7k9m2 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Equipment add-ons table
CREATE TABLE IF NOT EXISTS equipment_addons_rpc_x7k9m2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cost DECIMAL(10,2) NOT NULL CHECK (cost >= 0),
  description TEXT,
  state TEXT,
  manager_id UUID REFERENCES users_rpc_x7k9m2(id),
  rep_id UUID REFERENCES users_rpc_x7k9m2(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security for equipment addons
ALTER TABLE equipment_addons_rpc_x7k9m2 ENABLE ROW LEVEL SECURITY;

-- Policies for equipment addons
CREATE POLICY "All authenticated users can read equipment addons" ON equipment_addons_rpc_x7k9m2
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and managers can manage equipment addons" ON equipment_addons_rpc_x7k9m2
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_rpc_x7k9m2 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Settings table
CREATE TABLE IF NOT EXISTS settings_rpc_x7k9m2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deduct_percent DECIMAL(5,2) DEFAULT 10 CHECK (deduct_percent >= 0 AND deduct_percent <= 100),
  platinum_bonus DECIMAL(10,2) DEFAULT 50 CHECK (platinum_bonus >= 0),
  term_adjustment_36mo DECIMAL(10,2) DEFAULT 99 CHECK (term_adjustment_36mo >= 0),
  created_by_admin UUID REFERENCES users_rpc_x7k9m2(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security for settings
ALTER TABLE settings_rpc_x7k9m2 ENABLE ROW LEVEL SECURITY;

-- Policies for settings
CREATE POLICY "All authenticated users can read settings" ON settings_rpc_x7k9m2
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage settings" ON settings_rpc_x7k9m2
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_rpc_x7k9m2 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Calculations history table (for saving calculations)
CREATE TABLE IF NOT EXISTS calculations_rpc_x7k9m2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users_rpc_x7k9m2(id) NOT NULL,
  mmr DECIMAL(10,2) NOT NULL,
  qualification TEXT NOT NULL,
  contract_term INTEGER NOT NULL,
  platinum_protection BOOLEAN NOT NULL,
  base_package_id UUID REFERENCES base_packages_rpc_x7k9m2(id),
  addons JSONB,
  gross_revenue DECIMAL(10,2) NOT NULL,
  total_deductions DECIMAL(10,2) NOT NULL,
  final_pay DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security for calculations
ALTER TABLE calculations_rpc_x7k9m2 ENABLE ROW LEVEL SECURITY;

-- Policies for calculations
CREATE POLICY "Users can view their own calculations" ON calculations_rpc_x7k9m2
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calculations" ON calculations_rpc_x7k9m2
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all calculations" ON calculations_rpc_x7k9m2
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_rpc_x7k9m2 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default settings
INSERT INTO settings_rpc_x7k9m2 (deduct_percent, platinum_bonus, term_adjustment_36mo)
VALUES (10.0, 50.0, 99.0)
ON CONFLICT DO NOTHING;

-- Insert default multipliers
INSERT INTO multipliers_rpc_x7k9m2 (grade, value) VALUES
('A', 1.25),
('A-', 1.20),
('B+', 1.15),
('B', 1.10),
('B-', 1.05),
('C', 1.00)
ON CONFLICT DO NOTHING;

-- Insert sample base packages
INSERT INTO base_packages_rpc_x7k9m2 (name, equipment_cost, install_fee, activation_fee) VALUES
('Basic Security Package', 199.99, 99.00, 49.99),
('Advanced Security Package', 299.99, 129.00, 49.99),
('Premium Security Package', 399.99, 159.00, 49.99),
('Ultimate Security Package', 499.99, 199.00, 49.99)
ON CONFLICT DO NOTHING;

-- Insert sample equipment add-ons
INSERT INTO equipment_addons_rpc_x7k9m2 (name, cost, description) VALUES
('Door/Window Sensor', 29.99, 'Additional door or window sensor'),
('Motion Detector', 39.99, 'Indoor motion detection sensor'),
('Glass Break Detector', 49.99, 'Detects glass breaking sounds'),
('Smoke Detector', 59.99, 'Wireless smoke detection'),
('Camera Add-on', 129.99, 'Additional security camera'),
('Keypad', 79.99, 'Additional wireless keypad')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users_rpc_x7k9m2(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users_rpc_x7k9m2(role);
CREATE INDEX IF NOT EXISTS idx_multipliers_grade ON multipliers_rpc_x7k9m2(grade);
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations_rpc_x7k9m2(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations_rpc_x7k9m2(created_at);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_rpc_x7k9m2 (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'rep'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;