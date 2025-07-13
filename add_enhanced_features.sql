-- Add Enhanced Features to Existing Database
-- This script only adds triggers, views, functions, and sample data

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMP
-- ============================================================================

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updatedAt
DROP TRIGGER IF EXISTS update_agencies_updated_at ON "agencies";
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON "agencies" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON "users";
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON "customers";
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON "customers" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_insurance_partners_updated_at ON "insurance_partners";
CREATE TRIGGER update_insurance_partners_updated_at BEFORE UPDATE ON "insurance_partners" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_insurance_products_updated_at ON "insurance_products";
CREATE TRIGGER update_insurance_products_updated_at BEFORE UPDATE ON "insurance_products" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_policies_updated_at ON "policies";
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON "policies" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_updated_at ON "sales";
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON "sales" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_policy_reminders_updated_at ON "policy_reminders";
CREATE TRIGGER update_policy_reminders_updated_at BEFORE UPDATE ON "policy_reminders" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUDIT LOGGING TRIGGERS
-- ============================================================================

-- Function to create audit logs
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_data TEXT;
    new_data TEXT;
BEGIN
    IF TG_OP = 'UPDATE' THEN
        old_data = row_to_json(OLD)::TEXT;
        new_data = row_to_json(NEW)::TEXT;
    ELSIF TG_OP = 'DELETE' THEN
        old_data = row_to_json(OLD)::TEXT;
        new_data = NULL;
    ELSIF TG_OP = 'INSERT' THEN
        old_data = NULL;
        new_data = row_to_json(NEW)::TEXT;
    END IF;

    INSERT INTO audit_logs (
        "userId",
        "agencyId",
        "action",
        "tableName",
        "recordId",
        "oldValues",
        "newValues"
    ) VALUES (
        current_setting('app.current_user_id', true),
        COALESCE(
            NEW."agencyId",
            OLD."agencyId",
            current_setting('app.current_agency_id', true)
        ),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW."id", OLD."id"),
        old_data,
        new_data
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create audit triggers for all main tables
DROP TRIGGER IF EXISTS audit_agencies_trigger ON "agencies";
CREATE TRIGGER audit_agencies_trigger AFTER INSERT OR UPDATE OR DELETE ON "agencies" FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_users_trigger ON "users";
CREATE TRIGGER audit_users_trigger AFTER INSERT OR UPDATE OR DELETE ON "users" FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_customers_trigger ON "customers";
CREATE TRIGGER audit_customers_trigger AFTER INSERT OR UPDATE OR DELETE ON "customers" FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_insurance_partners_trigger ON "insurance_partners";
CREATE TRIGGER audit_insurance_partners_trigger AFTER INSERT OR UPDATE OR DELETE ON "insurance_partners" FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_insurance_products_trigger ON "insurance_products";
CREATE TRIGGER audit_insurance_products_trigger AFTER INSERT OR UPDATE OR DELETE ON "insurance_products" FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_policies_trigger ON "policies";
CREATE TRIGGER audit_policies_trigger AFTER INSERT OR UPDATE OR DELETE ON "policies" FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_sales_trigger ON "sales";
CREATE TRIGGER audit_sales_trigger AFTER INSERT OR UPDATE OR DELETE ON "sales" FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to generate CUID-like IDs
CREATE OR REPLACE FUNCTION generate_cuid()
RETURNS TEXT AS $$
DECLARE
    timestamp_part TEXT;
    random_part TEXT;
    counter_part TEXT;
BEGIN
    timestamp_part = lower(to_char(extract(epoch from now()) * 1000, 'FM000000000000'));
    random_part = lower(lpad(to_hex(floor(random() * 16777215)::bigint), 6, '0'));
    counter_part = lower(lpad(to_hex(floor(random() * 16777215)::bigint), 6, '0'));
    RETURN 'clx' || timestamp_part || random_part || counter_part;
END;
$$ LANGUAGE plpgsql;

-- Function to check if policy is expired
CREATE OR REPLACE FUNCTION is_policy_expired(policy_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    end_date TIMESTAMP;
BEGIN
    SELECT "endDate" INTO end_date FROM policies WHERE id = policy_id;
    RETURN end_date < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to get policy status based on dates
CREATE OR REPLACE FUNCTION get_policy_status(policy_id TEXT)
RETURNS "PolicyStatus" AS $$
DECLARE
    policy_record RECORD;
BEGIN
    SELECT * INTO policy_record FROM policies WHERE id = policy_id;
    
    IF policy_record.status = 'CANCELLED' THEN
        RETURN 'CANCELLED';
    ELSIF policy_record."endDate" < CURRENT_TIMESTAMP THEN
        RETURN 'EXPIRED';
    ELSIF policy_record."startDate" > CURRENT_TIMESTAMP THEN
        RETURN 'PENDING';
    ELSE
        RETURN 'ACTIVE';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate commission amount
CREATE OR REPLACE FUNCTION calculate_commission(premium_amount DECIMAL, commission_rate DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN (premium_amount * commission_rate) / 100;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PERFORMANCE VIEWS
-- ============================================================================

-- Dashboard Overview View
DROP VIEW IF EXISTS dashboard_overview;
CREATE VIEW dashboard_overview AS
SELECT 
    a.id as agency_id,
    a.name as agency_name,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT c.id) as total_customers,
    COUNT(DISTINCT p.id) as total_policies,
    COUNT(DISTINCT CASE WHEN p.status = 'ACTIVE' THEN p.id END) as active_policies,
    COUNT(DISTINCT CASE WHEN p.status = 'EXPIRED' THEN p.id END) as expired_policies,
    COUNT(DISTINCT s.id) as total_sales,
    COALESCE(SUM(s.amount), 0) as total_revenue,
    COALESCE(SUM(s.commission), 0) as total_commission
FROM agencies a
LEFT JOIN users u ON a.id = u."agencyId" AND u."isActive" = true
LEFT JOIN customers c ON a.id = c."agencyId" AND c."isActive" = true
LEFT JOIN policies p ON a.id = p."agencyId"
LEFT JOIN sales s ON a.id = s."agencyId"
WHERE a."isActive" = true
GROUP BY a.id, a.name;

-- Sales Performance View
DROP VIEW IF EXISTS sales_performance;
CREATE VIEW sales_performance AS
SELECT 
    s.id,
    s."saleDate",
    s.amount,
    s.commission,
    u.id as sales_agent_id,
    u."firstName" || ' ' || u."lastName" as sales_agent_name,
    c.id as customer_id,
    c."firstName" || ' ' || c."lastName" as customer_name,
    p."policyNumber",
    ip.name as product_name,
    ip.category as product_category,
    ipart.name as partner_name,
    a.id as agency_id,
    a.name as agency_name
FROM sales s
JOIN users u ON s."salesAgentId" = u.id
JOIN customers c ON s."customerId" = c.id
JOIN policies p ON s."policyId" = p.id
JOIN insurance_products ip ON p."productId" = ip.id
JOIN insurance_partners ipart ON p."partnerId" = ipart.id
JOIN agencies a ON s."agencyId" = a.id
WHERE s."saleDate" >= CURRENT_DATE - INTERVAL '30 days';

-- Policy Expiry Alerts View
DROP VIEW IF EXISTS policy_expiry_alerts;
CREATE VIEW policy_expiry_alerts AS
SELECT 
    p.id,
    p."policyNumber",
    p."endDate",
    p."endDate" - CURRENT_DATE as days_until_expiry,
    c."firstName" || ' ' || c."lastName" as customer_name,
    c.phone as customer_phone,
    c.email as customer_email,
    u."firstName" || ' ' || u."lastName" as sales_agent_name,
    u.phone as sales_agent_phone,
    u.email as sales_agent_email,
    ip.name as product_name,
    ipart.name as partner_name,
    a.name as agency_name,
    CASE 
        WHEN p."endDate" - CURRENT_DATE <= 30 THEN 'CRITICAL'
        WHEN p."endDate" - CURRENT_DATE <= 60 THEN 'WARNING'
        ELSE 'INFO'
    END as alert_level
FROM policies p
JOIN customers c ON p."customerId" = c.id
JOIN users u ON p."salesAgentId" = u.id
JOIN insurance_products ip ON p."productId" = ip.id
JOIN insurance_partners ipart ON p."partnerId" = ipart.id
JOIN agencies a ON p."agencyId" = a.id
WHERE p.status = 'ACTIVE' 
    AND p."endDate" > CURRENT_DATE 
    AND p."endDate" <= CURRENT_DATE + INTERVAL '90 days'
ORDER BY p."endDate" ASC;

-- Customer Overview View
DROP VIEW IF EXISTS customer_overview;
CREATE VIEW customer_overview AS
SELECT 
    c.id,
    c."firstName" || ' ' || c."lastName" as full_name,
    c.email,
    c.phone,
    c."isCorporate",
    c."companyName",
    c."tinNumber",
    c."isActive",
    a.name as agency_name,
    u."firstName" || ' ' || u."lastName" as assigned_agent,
    COUNT(p.id) as total_policies,
    COUNT(CASE WHEN p.status = 'ACTIVE' THEN p.id END) as active_policies,
    COUNT(CASE WHEN p.status = 'EXPIRED' THEN p.id END) as expired_policies,
    COALESCE(SUM(s.amount), 0) as total_premium_paid,
    COALESCE(SUM(s.commission), 0) as total_commission_generated,
    MAX(s."saleDate") as last_purchase_date
FROM customers c
JOIN agencies a ON c."agencyId" = a.id
LEFT JOIN users u ON c."assignedTo" = u.id
LEFT JOIN policies p ON c.id = p."customerId"
LEFT JOIN sales s ON p.id = s."policyId"
GROUP BY c.id, c."firstName", c."lastName", c.email, c.phone, c."isCorporate", 
         c."companyName", c."tinNumber", c."isActive", a.name, u."firstName", u."lastName";

-- Agent Performance View
DROP VIEW IF EXISTS agent_performance;
CREATE VIEW agent_performance AS
SELECT 
    u.id as agent_id,
    u."firstName" || ' ' || u."lastName" as agent_name,
    u.email as agent_email,
    u.phone as agent_phone,
    u.role,
    a.name as agency_name,
    COUNT(DISTINCT c.id) as customers_assigned,
    COUNT(DISTINCT p.id) as policies_sold,
    COUNT(DISTINCT CASE WHEN p.status = 'ACTIVE' THEN p.id END) as active_policies,
    COALESCE(SUM(s.amount), 0) as total_sales_amount,
    COALESCE(SUM(s.commission), 0) as total_commission_earned,
    COALESCE(AVG(s.amount), 0) as average_sale_amount,
    COUNT(DISTINCT CASE WHEN s."saleDate" >= CURRENT_DATE - INTERVAL '30 days' THEN s.id END) as sales_last_30_days,
    COALESCE(SUM(CASE WHEN s."saleDate" >= CURRENT_DATE - INTERVAL '30 days' THEN s.amount END), 0) as revenue_last_30_days
FROM users u
JOIN agencies a ON u."agencyId" = a.id
LEFT JOIN customers c ON u.id = c."assignedTo"
LEFT JOIN policies p ON u.id = p."salesAgentId"
LEFT JOIN sales s ON p.id = s."policyId"
WHERE u.role = 'SALES_AGENT' AND u."isActive" = true
GROUP BY u.id, u."firstName", u."lastName", u.email, u.phone, u.role, a.name;

-- Product Performance View
DROP VIEW IF EXISTS product_performance;
CREATE VIEW product_performance AS
SELECT 
    ip.id,
    ip.name as product_name,
    ip.category,
    ip.premium as base_premium,
    ip.commission as commission_rate,
    ipart.name as partner_name,
    a.name as agency_name,
    COUNT(p.id) as total_policies_sold,
    COUNT(CASE WHEN p.status = 'ACTIVE' THEN p.id END) as active_policies,
    COUNT(CASE WHEN p.status = 'EXPIRED' THEN p.id END) as expired_policies,
    COALESCE(SUM(s.amount), 0) as total_revenue,
    COALESCE(SUM(s.commission), 0) as total_commission,
    COALESCE(AVG(s.amount), 0) as average_sale_amount,
    COUNT(CASE WHEN s."saleDate" >= CURRENT_DATE - INTERVAL '30 days' THEN s.id END) as sales_last_30_days
FROM insurance_products ip
JOIN insurance_partners ipart ON ip."partnerId" = ipart.id
JOIN agencies a ON ip."agencyId" = a.id
LEFT JOIN policies p ON ip.id = p."productId"
LEFT JOIN sales s ON p.id = s."policyId"
WHERE ip."isActive" = true
GROUP BY ip.id, ip.name, ip.category, ip.premium, ip.commission, ipart.name, a.name;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Procedure to create a new policy with automatic sale record
CREATE OR REPLACE PROCEDURE create_policy_with_sale(
    p_policy_number TEXT,
    p_customer_id TEXT,
    p_product_id TEXT,
    p_partner_id TEXT,
    p_sales_agent_id TEXT,
    p_agency_id TEXT,
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP,
    p_premium DECIMAL,
    p_notes TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_policy_id TEXT;
    v_commission_rate DECIMAL;
    v_commission_amount DECIMAL;
BEGIN
    v_policy_id := generate_cuid();
    SELECT commission INTO v_commission_rate FROM insurance_products WHERE id = p_product_id;
    v_commission_amount := calculate_commission(p_premium, v_commission_rate);
    
    INSERT INTO policies (
        id, "policyNumber", "customerId", "productId", "partnerId", 
        "salesAgentId", "agencyId", "startDate", "endDate", 
        "premium", "commission", "notes", status
    ) VALUES (
        v_policy_id, p_policy_number, p_customer_id, p_product_id, p_partner_id,
        p_sales_agent_id, p_agency_id, p_start_date, p_end_date,
        p_premium, v_commission_amount, p_notes, 'ACTIVE'
    );
    
    INSERT INTO sales (
        id, "policyId", "customerId", "salesAgentId", "agencyId",
        "amount", "commission"
    ) VALUES (
        generate_cuid(), v_policy_id, p_customer_id, p_sales_agent_id, p_agency_id,
        p_premium, v_commission_amount
    );
    
    INSERT INTO policy_reminders (
        id, "policyId", "reminderDate"
    ) VALUES (
        generate_cuid(), v_policy_id, p_end_date - INTERVAL '30 days'
    );
    
    COMMIT;
END;
$$;

-- Procedure to update policy status based on dates
CREATE OR REPLACE PROCEDURE update_policy_statuses()
LANGUAGE plpgsql
AS $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT id, status, "startDate", "endDate" 
        FROM policies 
        WHERE status IN ('DRAFT', 'PENDING', 'ACTIVE')
    LOOP
        UPDATE policies 
        SET status = get_policy_status(policy_record.id)
        WHERE id = policy_record.id;
    END LOOP;
    
    COMMIT;
END;
$$;

-- ============================================================================
-- SAMPLE DATA INSERTION (only if tables are empty)
-- ============================================================================

-- Only insert sample data if tables are empty
DO $$
BEGIN
    -- Check if agencies table is empty
    IF NOT EXISTS (SELECT 1 FROM agencies LIMIT 1) THEN
        -- Sample Agency
        INSERT INTO "agencies" ("id", "name", "code", "address", "phone", "email", "website", "isActive") 
        VALUES (generate_cuid(), 'Sample Insurance Agency', 'SIA001', '123 Main Street, City, Country', '+1234567890', 'admin@sampleagency.com', 'https://sampleagency.com', true);
        
        -- Sample Admin User
        INSERT INTO "users" ("id", "email", "password", "firstName", "lastName", "phone", "role", "isActive", "agencyId") 
        VALUES (generate_cuid(), 'admin@sampleagency.com', '$2b$10$hashedpasswordhere', 'Admin', 'User', '+1234567890', 'AGENCY_MANAGER', true, (SELECT id FROM agencies WHERE code = 'SIA001'));
        
        -- Sample Sales Agent
        INSERT INTO "users" ("id", "email", "password", "firstName", "lastName", "phone", "role", "isActive", "agencyId") 
        VALUES (generate_cuid(), 'agent@sampleagency.com', '$2b$10$hashedpasswordhere', 'John', 'Agent', '+1234567891', 'SALES_AGENT', true, (SELECT id FROM agencies WHERE code = 'SIA001'));
        
        -- Sample Insurance Partner
        INSERT INTO "insurance_partners" ("id", "name", "code", "address", "phone", "email", "website", "isActive", "agencyId") 
        VALUES (generate_cuid(), 'Sample Insurance Company', 'SIC001', '456 Insurance Ave, City, Country', '+1234567891', 'contact@sampleinsurance.com', 'https://sampleinsurance.com', true, (SELECT id FROM agencies WHERE code = 'SIA001'));
        
        -- Sample Insurance Products
        INSERT INTO "insurance_products" ("id", "name", "description", "category", "premium", "commission", "isActive", "partnerId", "agencyId") 
        VALUES 
            (generate_cuid(), 'Comprehensive Motor Insurance', 'Full coverage motor insurance policy', 'Motor', 500.00, 15.00, true, (SELECT id FROM insurance_partners WHERE code = 'SIC001'), (SELECT id FROM agencies WHERE code = 'SIA001')),
            (generate_cuid(), 'Third Party Motor Insurance', 'Basic third party motor insurance', 'Motor', 200.00, 10.00, true, (SELECT id FROM insurance_partners WHERE code = 'SIC001'), (SELECT id FROM agencies WHERE code = 'SIA001')),
            (generate_cuid(), 'Health Insurance', 'Comprehensive health coverage', 'Health', 800.00, 20.00, true, (SELECT id FROM insurance_partners WHERE code = 'SIC001'), (SELECT id FROM agencies WHERE code = 'SIA001')),
            (generate_cuid(), 'Life Insurance', 'Term life insurance policy', 'Life', 1200.00, 25.00, true, (SELECT id FROM insurance_partners WHERE code = 'SIC001'), (SELECT id FROM agencies WHERE code = 'SIA001'));
        
        -- Sample Customers
        INSERT INTO "customers" ("id", "firstName", "lastName", "email", "phone", "address", "isCorporate", "isActive", "agencyId", "assignedTo") 
        VALUES 
            (generate_cuid(), 'John', 'Doe', 'john.doe@email.com', '+1234567892', '789 Customer St, City, Country', false, true, (SELECT id FROM agencies WHERE code = 'SIA001'), (SELECT id FROM users WHERE email = 'agent@sampleagency.com')),
            (generate_cuid(), 'Jane', 'Smith', 'jane.smith@email.com', '+1234567893', '456 Customer Ave, City, Country', false, true, (SELECT id FROM agencies WHERE code = 'SIA001'), (SELECT id FROM users WHERE email = 'agent@sampleagency.com')),
            (generate_cuid(), 'ABC Corporation', 'ABC Corp', 'contact@abccorp.com', '+1234567894', '123 Business Blvd, City, Country', true, true, (SELECT id FROM agencies WHERE code = 'SIA001'), (SELECT id FROM users WHERE email = 'agent@sampleagency.com'));
        
        -- Sample Policies and Sales
        CALL create_policy_with_sale(
            'POL001',
            (SELECT id FROM customers WHERE email = 'john.doe@email.com'),
            (SELECT id FROM insurance_products WHERE name = 'Comprehensive Motor Insurance'),
            (SELECT id FROM insurance_partners WHERE code = 'SIC001'),
            (SELECT id FROM users WHERE email = 'agent@sampleagency.com'),
            (SELECT id FROM agencies WHERE code = 'SIA001'),
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '1 year',
            500.00,
            'Sample motor insurance policy'
        );
        
        CALL create_policy_with_sale(
            'POL002',
            (SELECT id FROM customers WHERE email = 'jane.smith@email.com'),
            (SELECT id FROM insurance_products WHERE name = 'Health Insurance'),
            (SELECT id FROM insurance_partners WHERE code = 'SIC001'),
            (SELECT id FROM users WHERE email = 'agent@sampleagency.com'),
            (SELECT id FROM agencies WHERE code = 'SIA001'),
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '1 year',
            800.00,
            'Sample health insurance policy'
        );
        
        -- Update policy statuses
        CALL update_policy_statuses();
        
        RAISE NOTICE 'Sample data inserted successfully!';
    ELSE
        RAISE NOTICE 'Tables already contain data, skipping sample data insertion.';
    END IF;
END $$;

COMMIT; 