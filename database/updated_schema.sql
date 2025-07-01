-- Updated Brinks Pay Calculator Schema based on official payout document
-- Run this in your Supabase SQL Editor

-- Drop existing constraints and update tables
ALTER TABLE multipliers_rpc_x7k9m2 DROP CONSTRAINT IF EXISTS multipliers_rpc_x7k9m2_grade_check;
ALTER TABLE multipliers_rpc_x7k9m2 ADD CONSTRAINT multipliers_rpc_x7k9m2_grade_check 
CHECK (grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D'));

-- Update base packages structure to match Brinks packages
TRUNCATE base_packages_rpc_x7k9m2;
INSERT INTO base_packages_rpc_x7k9m2 (name, equipment_cost, install_fee, activation_fee) VALUES
('Essential', 199.99, 99.00, 49.99),
('Complete', 299.99, 99.00, 49.99),
('Complete Plus', 399.99, 99.00, 49.99),
('Ultimate', 499.99, 99.00, 49.99),
('Ultimate Plus', 599.99, 99.00, 49.99);

-- Update multipliers based on the document
TRUNCATE multipliers_rpc_x7k9m2;
INSERT INTO multipliers_rpc_x7k9m2 (grade, value) VALUES
('A+', 1.50),
('A', 1.40),
('A-', 1.30),
('B+', 1.20),
('B', 1.10),
('B-', 1.00),
('C+', 0.90),
('C', 0.80),
('C-', 0.70),
('D', 0.60);

-- Add commission structure table
CREATE TABLE IF NOT EXISTS commission_structure_rpc_x7k9m2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mmr_range_min DECIMAL(10,2) NOT NULL,
    mmr_range_max DECIMAL(10,2) NOT NULL,
    base_commission DECIMAL(10,2) NOT NULL,
    spiff_amount DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert commission tiers
INSERT INTO commission_structure_rpc_x7k9m2 (mmr_range_min, mmr_range_max, base_commission, spiff_amount, description) VALUES
(29.99, 39.99, 25.00, 0, 'Basic Tier'),
(40.00, 49.99, 35.00, 10.00, 'Standard Tier'),
(50.00, 59.99, 45.00, 15.00, 'Premium Tier'),
(60.00, 69.99, 55.00, 20.00, 'Elite Tier'),
(70.00, 79.99, 65.00, 25.00, 'Ultimate Tier'),
(80.00, 99.99, 75.00, 30.00, 'Platinum Tier');

-- Add protection plans table
CREATE TABLE IF NOT EXISTS protection_plans_rpc_x7k9m2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO protection_plans_rpc_x7k9m2 (name, commission_amount) VALUES
('Basic Protection', 15.00),
('Enhanced Protection', 25.00),
('Premium Protection', 35.00),
('Ultimate Protection', 50.00);

-- Add service add-ons with commissions
TRUNCATE equipment_addons_rpc_x7k9m2;
INSERT INTO equipment_addons_rpc_x7k9m2 (name, cost, description) VALUES
('Door/Window Sensor', 5.00, 'Commission per sensor'),
('Motion Detector', 8.00, 'Commission per detector'),
('Glass Break Sensor', 10.00, 'Commission per sensor'),
('Smoke Detector', 12.00, 'Commission per detector'),
('Indoor Camera', 15.00, 'Commission per camera'),
('Outdoor Camera', 20.00, 'Commission per camera'),
('Smart Lock', 25.00, 'Commission per lock'),
('Thermostat', 20.00, 'Commission per thermostat'),
('Garage Door Controller', 15.00, 'Commission per controller'),
('Water Sensor', 8.00, 'Commission per sensor');

-- Update settings for accurate calculations
UPDATE settings_rpc_x7k9m2 SET
    deduct_percent = 0,  -- No percentage deduction in the document
    platinum_bonus = 0,  -- Handled by protection plans
    term_adjustment_36mo = 0; -- No term adjustments shown

-- Add new settings for Brinks-specific calculations
ALTER TABLE settings_rpc_x7k9m2 ADD COLUMN IF NOT EXISTS min_mmr DECIMAL(10,2) DEFAULT 29.99;
ALTER TABLE settings_rpc_x7k9m2 ADD COLUMN IF NOT EXISTS max_mmr DECIMAL(10,2) DEFAULT 89.99;
ALTER TABLE settings_rpc_x7k9m2 ADD COLUMN IF NOT EXISTS install_bonus DECIMAL(10,2) DEFAULT 25.00;
ALTER TABLE settings_rpc_x7k9m2 ADD COLUMN IF NOT EXISTS activation_bonus DECIMAL(10,2) DEFAULT 10.00;

-- Enable RLS for new tables
ALTER TABLE commission_structure_rpc_x7k9m2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE protection_plans_rpc_x7k9m2 ENABLE ROW LEVEL SECURITY;

-- Public read access for new tables
CREATE POLICY "Public read access to commission structure" ON commission_structure_rpc_x7k9m2 FOR SELECT USING (true);
CREATE POLICY "Public read access to protection plans" ON protection_plans_rpc_x7k9m2 FOR SELECT USING (true);

-- Admin only policies for modifications
CREATE POLICY "Only admins can modify commission structure" ON commission_structure_rpc_x7k9m2 FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users_rpc_x7k9m2 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Only admins can modify protection plans" ON protection_plans_rpc_x7k9m2 FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users_rpc_x7k9m2 
        WHERE id = auth.uid() AND role = 'admin'
    )
);