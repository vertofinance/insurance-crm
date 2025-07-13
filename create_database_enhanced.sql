-- Enhanced Insurance CRM Database Creation Script
-- This script includes triggers, views, functions, and performance optimizations

-- Create UserRole enum
CREATE TYPE "UserRole" AS ENUM ('AGENCY_MANAGER', 'HR_MANAGER', 'SALES_AGENT');

-- Create PolicyStatus enum
CREATE TYPE "PolicyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING');

-- Create agencies table
CREATE TABLE "agencies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on code
CREATE UNIQUE INDEX "agencies_code_key" ON "agencies"("code");

-- Create users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "agencyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on email
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Create customers table
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "tinNumber" TEXT,
    "companyName" TEXT,
    "companyReg" TEXT,
    "isCorporate" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "agencyId" TEXT NOT NULL,
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- Create insurance_partners table
CREATE TABLE "insurance_partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "agencyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insurance_partners_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on code
CREATE UNIQUE INDEX "insurance_partners_code_key" ON "insurance_partners"("code");

-- Create insurance_products table
CREATE TABLE "insurance_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "premium" DECIMAL(10,2) NOT NULL,
    "commission" DECIMAL(5,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "partnerId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insurance_products_pkey" PRIMARY KEY ("id")
);

-- Create policies table
CREATE TABLE "policies" (
    "id" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "salesAgentId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "status" "PolicyStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "premium" DECIMAL(10,2) NOT NULL,
    "commission" DECIMAL(10,2) NOT NULL,
    "documents" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on policyNumber
CREATE UNIQUE INDEX "policies_policyNumber_key" ON "policies"("policyNumber");

-- Create sales table
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "salesAgentId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "commission" DECIMAL(10,2) NOT NULL,
    "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on policyId
CREATE UNIQUE INDEX "sales_policyId_key" ON "sales"("policyId");

-- Create policy_reminders table
CREATE TABLE "policy_reminders" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "reminderDate" TIMESTAMP(3) NOT NULL,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_reminders_pkey" PRIMARY KEY ("id")
);

-- Create audit_logs table
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "agencyId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "oldValues" TEXT,
    "newValues" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints

-- Users -> Agency
ALTER TABLE "users" ADD CONSTRAINT "users_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Customers -> Agency
ALTER TABLE "customers" ADD CONSTRAINT "customers_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Customers -> User (assignedTo)
ALTER TABLE "customers" ADD CONSTRAINT "customers_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Insurance Partners -> Agency
ALTER TABLE "insurance_partners" ADD CONSTRAINT "insurance_partners_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insurance Products -> Partner
ALTER TABLE "insurance_products" ADD CONSTRAINT "insurance_products_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "insurance_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insurance Products -> Agency
ALTER TABLE "insurance_products" ADD CONSTRAINT "insurance_products_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Policies -> Customer
ALTER TABLE "policies" ADD CONSTRAINT "policies_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Policies -> Product
ALTER TABLE "policies" ADD CONSTRAINT "policies_productId_fkey" FOREIGN KEY ("productId") REFERENCES "insurance_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Policies -> Partner
ALTER TABLE "policies" ADD CONSTRAINT "policies_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "insurance_partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Policies -> User (salesAgent)
ALTER TABLE "policies" ADD CONSTRAINT "policies_salesAgentId_fkey" FOREIGN KEY ("salesAgentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Policies -> Agency
ALTER TABLE "policies" ADD CONSTRAINT "policies_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Sales -> Policy
ALTER TABLE "sales" ADD CONSTRAINT "sales_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Sales -> Customer
ALTER TABLE "sales" ADD CONSTRAINT "sales_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Sales -> User (salesAgent)
ALTER TABLE "sales" ADD CONSTRAINT "sales_salesAgentId_fkey" FOREIGN KEY ("salesAgentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Sales -> Agency
ALTER TABLE "sales" ADD CONSTRAINT "sales_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Policy Reminders -> Policy
ALTER TABLE "policy_reminders" ADD CONSTRAINT "policy_reminders_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for better performance
CREATE INDEX "users_agencyId_idx" ON "users"("agencyId");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_isActive_idx" ON "users"("isActive");
CREATE INDEX "customers_agencyId_idx" ON "customers"("agencyId");
CREATE INDEX "customers_assignedTo_idx" ON "customers"("assignedTo");
CREATE INDEX "customers_isCorporate_idx" ON "customers"("isCorporate");
CREATE INDEX "customers_isActive_idx" ON "customers"("isActive");
CREATE INDEX "customers_email_idx" ON "customers"("email");
CREATE INDEX "insurance_partners_agencyId_idx" ON "insurance_partners"("agencyId");
CREATE INDEX "insurance_partners_isActive_idx" ON "insurance_partners"("isActive");
CREATE INDEX "insurance_products_partnerId_idx" ON "insurance_products"("partnerId");
CREATE INDEX "insurance_products_agencyId_idx" ON "insurance_products"("agencyId");
CREATE INDEX "insurance_products_category_idx" ON "insurance_products"("category");
CREATE INDEX "insurance_products_isActive_idx" ON "insurance_products"("isActive");
CREATE INDEX "policies_customerId_idx" ON "policies"("customerId");
CREATE INDEX "policies_productId_idx" ON "policies"("productId");
CREATE INDEX "policies_partnerId_idx" ON "policies"("partnerId");
CREATE INDEX "policies_salesAgentId_idx" ON "policies"("salesAgentId");
CREATE INDEX "policies_agencyId_idx" ON "policies"("agencyId");
CREATE INDEX "policies_status_idx" ON "policies"("status");
CREATE INDEX "policies_startDate_idx" ON "policies"("startDate");
CREATE INDEX "policies_endDate_idx" ON "policies"("endDate");
CREATE INDEX "sales_policyId_idx" ON "sales"("policyId");
CREATE INDEX "sales_customerId_idx" ON "sales"("customerId");
CREATE INDEX "sales_salesAgentId_idx" ON "sales"("salesAgentId");
CREATE INDEX "sales_agencyId_idx" ON "sales"("agencyId");
CREATE INDEX "sales_saleDate_idx" ON "sales"("saleDate");
CREATE INDEX "policy_reminders_policyId_idx" ON "policy_reminders"("policyId");
CREATE INDEX "policy_reminders_reminderDate_idx" ON "policy_reminders"("reminderDate");
CREATE INDEX "policy_reminders_isSent_idx" ON "policy_reminders"("isSent");
CREATE INDEX "audit_logs_agencyId_idx" ON "audit_logs"("agencyId");
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
CREATE INDEX "audit_logs_tableName_idx" ON "audit_logs"("tableName");

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
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON "agencies" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON "customers" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insurance_partners_updated_at BEFORE UPDATE ON "insurance_partners" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insurance_products_updated_at BEFORE UPDATE ON "insurance_products" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON "policies" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON "sales" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
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
CREATE TRIGGER audit_agencies_trigger AFTER INSERT OR UPDATE OR DELETE ON "agencies" FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_users_trigger AFTER INSERT OR UPDATE OR DELETE ON "users" FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_customers_trigger AFTER INSERT OR UPDATE OR DELETE ON "customers" FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_insurance_partners_trigger AFTER INSERT OR UPDATE OR DELETE ON "insurance_partners" FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_insurance_products_trigger AFTER INSERT OR UPDATE OR DELETE ON "insurance_products" FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_policies_trigger AFTER INSERT OR UPDATE OR DELETE ON "policies" FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
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
    -- Generate timestamp part (base36)
    timestamp_part = lower(to_char(extract(epoch from now()) * 1000, 'FM000000000000'));
    
    -- Generate random part
    random_part = lower(lpad(to_hex(floor(random() * 16777215)::bigint), 6, '0'));
    
    -- Generate counter part
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
    -- Generate policy ID
    v_policy_id := generate_cuid();
    
    -- Get commission rate from product
    SELECT commission INTO v_commission_rate 
    FROM insurance_products 
    WHERE id = p_product_id;
    
    -- Calculate commission amount
    v_commission_amount := calculate_commission(p_premium, v_commission_rate);
    
    -- Insert policy
    INSERT INTO policies (
        id, "policyNumber", "customerId", "productId", "partnerId", 
        "salesAgentId", "agencyId", "startDate", "endDate", 
        "premium", "commission", "notes", status
    ) VALUES (
        v_policy_id, p_policy_number, p_customer_id, p_product_id, p_partner_id,
        p_sales_agent_id, p_agency_id, p_start_date, p_end_date,
        p_premium, v_commission_amount, p_notes, 'ACTIVE'
    );
    
    -- Insert sale record
    INSERT INTO sales (
        id, "policyId", "customerId", "salesAgentId", "agencyId",
        "amount", "commission"
    ) VALUES (
        generate_cuid(), v_policy_id, p_customer_id, p_sales_agent_id, p_agency_id,
        p_premium, v_commission_amount
    );
    
    -- Create policy reminder for expiry
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
-- SAMPLE DATA INSERTION
-- ============================================================================

-- Sample Agency
INSERT INTO "agencies" ("id", "name", "code", "address", "phone", "email", "website", "isActive") 
VALUES (generate_cuid(), 'Sample Insurance Agency', 'SIA001', '123 Main Street, City, Country', '+1234567890', 'admin@sampleagency.com', 'https://sampleagency.com', true);

-- Sample Admin User (password should be hashed in production)
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

-- Sample Policies and Sales (using the stored procedure)
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

COMMIT; 