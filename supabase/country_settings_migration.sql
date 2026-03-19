-- ============================================
-- 20. country_settings — Country-specific pricing & phone settings
-- ============================================
CREATE TABLE country_settings (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT UNIQUE NOT NULL,
    code        TEXT,           -- ISO Country Code
    phone_code  TEXT,           -- e.g. +91, +1
    currency    TEXT,           -- e.g. ₹, $
    budgets     JSONB DEFAULT '[]'::jsonb,
    is_active   BOOLEAN DEFAULT true,
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Seed defaults
INSERT INTO country_settings (name, code, phone_code, currency, budgets) VALUES
    ('India', 'IN', '+91', '₹', '["< ₹80k", "₹80k - ₹4L", "₹4L+"]'::jsonb),
    ('United States', 'US', '+1', '$', '["< $1k", "$1k - $5k", "$5k+"]'::jsonb),
    ('United Kingdom', 'GB', '+44', '£', '["< £800", "£800 - £4k", "£4k+"]'::jsonb);

ALTER TABLE country_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read country_settings"  ON country_settings FOR SELECT USING (true);
CREATE POLICY "Admin can manage country_settings" ON country_settings FOR ALL    USING (auth.role() = 'authenticated');

CREATE TRIGGER set_updated_at BEFORE UPDATE ON country_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
