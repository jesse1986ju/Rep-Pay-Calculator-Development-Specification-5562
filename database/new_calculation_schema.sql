-- Updated Brinks Pay Calculator Schema based on new requirements
-- Run this in your Supabase SQL Editor

-- Update base packages with correct MMR values and passthrough deductions
TRUNCATE base_packages_rpc_x7k9m2;
INSERT INTO base_packages_rpc_x7k9m2 (name, equipment_cost, install_fee, activation_fee) VALUES
('Interactive', 199.99, 99.00, 49.99),
('Doorbell', 299.99, 129.00, 49.99),
('Outdoor', 399.99, 159.00, 49.99);

-- Add MMR and passthrough columns to base packages
ALTER TABLE base_packages_rpc_x7k9m2 
ADD COLUMN IF NOT EXISTS mmr_value DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS passthrough_deduction DECIMAL(10,2) DEFAULT 0;

-- Update packages with correct MMR and passthrough values
UPDATE base_packages_rpc_x7k9m2 SET 
    mmr_value = 54.99, 
    passthrough_deduction = 4.00 
WHERE name = 'Interactive';

UPDATE base_packages_rpc_x7k9m2 SET 
    mmr_value = 64.99, 
    passthrough_deduction = 6.50 
WHERE name = 'Doorbell';

UPDATE base_packages_rpc_x7k9m2 SET 
    mmr_value = 69.99, 
    passthrough_deduction = 8.50 
WHERE name = 'Outdoor';

-- Update multipliers based on new requirements
TRUNCATE multipliers_rpc_x7k9m2;
INSERT INTO multipliers_rpc_x7k9m2 (grade, value) VALUES
('A', 23),
('A-', 22),
('B+', 21),
('B', 20),
('B-', 18),
('C', 17);

-- Update settings for new calculation logic
UPDATE settings_rpc_x7k9m2 SET
    deduct_percent = 10.0,
    platinum_bonus = 2,  -- Now represents multiplier bonus
    term_adjustment_36mo = 0;  -- Will be handled differently

-- Add new settings columns
ALTER TABLE settings_rpc_x7k9m2 
ADD COLUMN IF NOT EXISTS c_grade_install_fee DECIMAL(10,2) DEFAULT 199.00,
ADD COLUMN IF NOT EXISTS ach_bonus DECIMAL(10,2) DEFAULT 2,
ADD COLUMN IF NOT EXISTS contract_60_bonus DECIMAL(10,2) DEFAULT 2;

-- Update equipment addons with realistic costs
TRUNCATE equipment_addons_rpc_x7k9m2;
INSERT INTO equipment_addons_rpc_x7k9m2 (name, cost, description) VALUES
('Door/Window Sensor', 29.99, 'Additional door or window sensor'),
('Motion Detector', 39.99, 'Indoor motion detection sensor'),
('Glass Break Detector', 49.99, 'Detects glass breaking sounds'),
('Smoke Detector', 59.99, 'Wireless smoke detection'),
('Indoor Camera', 129.99, 'Additional indoor security camera'),
('Outdoor Camera', 179.99, 'Weather-resistant outdoor camera'),
('Smart Lock', 199.99, 'Smart door lock with app control'),
('Keypad', 79.99, 'Additional wireless keypad'),
('Garage Door Controller', 99.99, 'Smart garage door opener'),
('Water Sensor', 49.99, 'Water leak detection sensor');

-- Create billing types table
CREATE TABLE IF NOT EXISTS billing_types_rpc_x7k9m2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    bonus_multiplier DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO billing_types_rpc_x7k9m2 (name, bonus_multiplier) VALUES
('ACH', 2),
('Credit Card', 0),
('Manual Billing', 0);

-- Create contract terms table  
CREATE TABLE IF NOT EXISTS contract_terms_rpc_x7k9m2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    months INTEGER NOT NULL,
    bonus_multiplier DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO contract_terms_rpc_x7k9m2 (months, bonus_multiplier) VALUES
(60, 2),
(36, 0);

-- Enable RLS for new tables
ALTER TABLE billing_types_rpc_x7k9m2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_terms_rpc_x7k9m2 ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access to billing types" ON billing_types_rpc_x7k9m2 FOR SELECT USING (true);
CREATE POLICY "Public read access to contract terms" ON contract_terms_rpc_x7k9m2 FOR SELECT USING (true);

-- Admin only policies
CREATE POLICY "Only admins can modify billing types" ON billing_types_rpc_x7k9m2 FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users_rpc_x7k9m2 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Only admins can modify contract terms" ON contract_terms_rpc_x7k9m2 FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users_rpc_x7k9m2 
        WHERE id = auth.uid() AND role = 'admin'
    )
);