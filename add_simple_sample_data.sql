-- Simple sample data using existing IDs
-- First, get existing IDs
DO $$
DECLARE
    existing_customer_id TEXT;
    existing_product_id TEXT;
    existing_partner_id TEXT;
    existing_user_id TEXT;
    existing_agency_id TEXT;
BEGIN
    -- Get existing IDs
    SELECT id INTO existing_customer_id FROM customers LIMIT 1;
    SELECT id INTO existing_product_id FROM insurance_products LIMIT 1;
    SELECT id INTO existing_partner_id FROM insurance_partners LIMIT 1;
    SELECT id INTO existing_user_id FROM users LIMIT 1;
    SELECT id INTO existing_agency_id FROM agencies LIMIT 1;

    -- Insert sample policies using existing IDs
    INSERT INTO policies (id, "policyNumber", "customerId", "productId", "partnerId", "salesAgentId", "agencyId", status, "startDate", "endDate", premium, commission, documents, notes, "createdAt", "updatedAt") VALUES
    ('clx1a2b3c4d5e6f7g8h9i0j1', 'POL-2024-001', existing_customer_id, existing_product_id, existing_partner_id, existing_user_id, existing_agency_id, 'ACTIVE', '2024-01-15', '2025-01-15', 1200.00, 120.00, ARRAY['policy_doc_001.pdf'], 'Comprehensive motor insurance', NOW(), NOW()),
    ('clx2b3c4d5e6f7g8h9i0j1k2', 'POL-2024-002', existing_customer_id, existing_product_id, existing_partner_id, existing_user_id, existing_agency_id, 'ACTIVE', '2024-02-01', '2025-02-01', 800.00, 80.00, ARRAY['health_policy_002.pdf'], 'Family health insurance', NOW(), NOW()),
    ('clx3c4d5e6f7g8h9i0j1k2l3', 'POL-2024-003', existing_customer_id, existing_product_id, existing_partner_id, existing_user_id, existing_agency_id, 'PENDING', '2024-03-01', '2025-03-01', 2500.00, 250.00, ARRAY['life_policy_003.pdf'], 'Term life insurance', NOW(), NOW()),
    ('clx4d5e6f7g8h9i0j1k2l3m4', 'POL-2024-004', existing_customer_id, existing_product_id, existing_partner_id, existing_user_id, existing_agency_id, 'EXPIRED', '2023-06-01', '2024-06-01', 1500.00, 150.00, ARRAY['property_policy_004.pdf'], 'Home insurance - expired', NOW(), NOW()),
    ('clx5e6f7g8h9i0j1k2l3m4n5', 'POL-2024-005', existing_customer_id, existing_product_id, existing_partner_id, existing_user_id, existing_agency_id, 'CANCELLED', '2024-01-01', '2025-01-01', 900.00, 90.00, ARRAY['travel_policy_005.pdf'], 'Travel insurance - cancelled', NOW(), NOW());

    -- Insert sample sales records
    INSERT INTO sales (id, "policyId", "customerId", "salesAgentId", "agencyId", amount, commission, "saleDate", "createdAt", "updatedAt") VALUES
    ('clx6f7g8h9i0j1k2l3m4n5o6', 'clx1a2b3c4d5e6f7g8h9i0j1', existing_customer_id, existing_user_id, existing_agency_id, 1200.00, 120.00, '2024-01-15', NOW(), NOW()),
    ('clx7g8h9i0j1k2l3m4n5o6p7', 'clx2b3c4d5e6f7g8h9i0j1k2', existing_customer_id, existing_user_id, existing_agency_id, 800.00, 80.00, '2024-02-01', NOW(), NOW()),
    ('clx8h9i0j1k2l3m4n5o6p7q8', 'clx3c4d5e6f7g8h9i0j1k2l3', existing_customer_id, existing_user_id, existing_agency_id, 2500.00, 250.00, '2024-03-01', NOW(), NOW()),
    ('clx9i0j1k2l3m4n5o6p7q8r9', 'clx4d5e6f7g8h9i0j1k2l3m4', existing_customer_id, existing_user_id, existing_agency_id, 1500.00, 150.00, '2023-06-01', NOW(), NOW()),
    ('clx0j1k2l3m4n5o6p7q8r9s0', 'clx5e6f7g8h9i0j1k2l3m4n5', existing_customer_id, existing_user_id, existing_agency_id, 900.00, 90.00, '2024-01-01', NOW(), NOW());

    -- Insert sample policy reminders
    INSERT INTO policy_reminders (id, "policyId", "reminderDate", "isSent", "sentAt", "createdAt", "updatedAt") VALUES
    ('clx1k2l3m4n5o6p7q8r9s0t1', 'clx1a2b3c4d5e6f7g8h9i0j1', '2024-12-15', false, NULL, NOW(), NOW()),
    ('clx2l3m4n5o6p7q8r9s0t1u2', 'clx2b3c4d5e6f7g8h9i0j1k2', '2025-01-01', false, NULL, NOW(), NOW()),
    ('clx3m4n5o6p7q8r9s0t1u2v3', 'clx3c4d5e6f7g8h9i0j1k2l3', '2025-02-01', false, NULL, NOW(), NOW()),
    ('clx4n5o6p7q8r9s0t1u2v3w4', 'clx1a2b3c4d5e6f7g8h9i0j1', '2024-11-15', true, '2024-11-15 09:00:00', NOW(), NOW()),
    ('clx5o6p7q8r9s0t1u2v3w4x5', 'clx2b3c4d5e6f7g8h9i0j1k2', '2024-12-01', true, '2024-12-01 10:30:00', NOW(), NOW());

END $$;

COMMIT; 