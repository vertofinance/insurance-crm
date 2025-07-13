-- Add comprehensive sample data for policies, sales, and reminders
-- This will create a realistic insurance CRM dataset

-- Insert sample policies
INSERT INTO policies (id, "policyNumber", "customerId", "productId", "partnerId", "salesAgentId", "agencyId", status, "startDate", "endDate", premium, commission, documents, notes, "createdAt", "updatedAt") VALUES
('clx1a2b3c4d5e6f7g8h9i0j1', 'POL-2024-001', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'ACTIVE', '2024-01-15', '2025-01-15', 1200.00, 120.00, ARRAY['policy_doc_001.pdf', 'terms_001.pdf'], 'Comprehensive motor insurance for new vehicle', NOW(), NOW()),
('clx2b3c4d5e6f7g8h9i0j1k2', 'POL-2024-002', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'ACTIVE', '2024-02-01', '2025-02-01', 800.00, 80.00, ARRAY['health_policy_002.pdf'], 'Family health insurance coverage', NOW(), NOW()),
('clx3c4d5e6f7g8h9i0j1k2l3', 'POL-2024-003', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'PENDING', '2024-03-01', '2025-03-01', 2500.00, 250.00, ARRAY['life_policy_003.pdf'], 'Term life insurance for family protection', NOW(), NOW()),
('clx4d5e6f7g8h9i0j1k2l3m4', 'POL-2024-004', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'EXPIRED', '2023-06-01', '2024-06-01', 1500.00, 150.00, ARRAY['property_policy_004.pdf'], 'Home insurance policy - expired', NOW(), NOW()),
('clx5e6f7g8h9i0j1k2l3m4n5', 'POL-2024-005', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'CANCELLED', '2024-01-01', '2025-01-01', 900.00, 90.00, ARRAY['travel_policy_005.pdf'], 'Travel insurance - cancelled by customer', NOW(), NOW());

-- Insert sample sales records
INSERT INTO sales (id, "policyId", "customerId", "salesAgentId", "agencyId", amount, commission, "saleDate", "createdAt", "updatedAt") VALUES
('clx6f7g8h9i0j1k2l3m4n5o6', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 1200.00, 120.00, '2024-01-15', NOW(), NOW()),
('clx7g8h9i0j1k2l3m4n5o6p7', 'clx2b3c4d5e6f7g8h9i0j1k2', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 800.00, 80.00, '2024-02-01', NOW(), NOW()),
('clx8h9i0j1k2l3m4n5o6p7q8', 'clx3c4d5e6f7g8h9i0j1k2l3', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 2500.00, 250.00, '2024-03-01', NOW(), NOW()),
('clx9i0j1k2l3m4n5o6p7q8r9', 'clx4d5e6f7g8h9i0j1k2l3m4', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 1500.00, 150.00, '2023-06-01', NOW(), NOW()),
('clx0j1k2l3m4n5o6p7q8r9s0', 'clx5e6f7g8h9i0j1k2l3m4n5', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 900.00, 90.00, '2024-01-01', NOW(), NOW());

-- Insert sample policy reminders
INSERT INTO policy_reminders (id, "policyId", "reminderDate", "isSent", "sentAt", "createdAt", "updatedAt") VALUES
('clx1k2l3m4n5o6p7q8r9s0t1', 'clx1a2b3c4d5e6f7g8h9i0j1', '2024-12-15', false, NULL, NOW(), NOW()),
('clx2l3m4n5o6p7q8r9s0t1u2', 'clx2b3c4d5e6f7g8h9i0j1k2', '2025-01-01', false, NULL, NOW(), NOW()),
('clx3m4n5o6p7q8r9s0t1u2v3', 'clx3c4d5e6f7g8h9i0j1k2l3', '2025-02-01', false, NULL, NOW(), NOW()),
('clx4n5o6p7q8r9s0t1u2v3w4', 'clx1a2b3c4d5e6f7g8h9i0j1', '2024-11-15', true, '2024-11-15 09:00:00', NOW(), NOW()),
('clx5o6p7q8r9s0t1u2v3w4x5', 'clx2b3c4d5e6f7g8h9i0j1k2', '2024-12-01', true, '2024-12-01 10:30:00', NOW(), NOW());

-- Add more customers for variety
INSERT INTO customers (id, "firstName", "lastName", email, phone, address, "dateOfBirth", "tinNumber", "companyName", "companyReg", "isCorporate", "isActive", "agencyId", "assignedTo", "createdAt", "updatedAt") VALUES
('clx2a3b4c5d6e7f8g9h0i1j2', 'Sarah', 'Johnson', 'sarah.johnson@email.com', '+1234567891', '456 Oak Street, City, State 12345', '1985-03-15', 'TIN123456789', NULL, NULL, false, true, 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', NOW(), NOW()),
('clx3b4c5d6e7f8g9h0i1j2k3', 'Michael', 'Chen', 'michael.chen@email.com', '+1234567892', '789 Pine Avenue, City, State 12345', '1978-07-22', 'TIN987654321', NULL, NULL, false, true, 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', NOW(), NOW()),
('clx4c5d6e7f8g9h0i1j2k3l4', 'ABC Corporation', 'Ltd', 'contact@abccorp.com', '+1234567893', '123 Business Park, City, State 12345', NULL, 'TIN456789123', 'ABC Corporation Ltd', 'REG123456', true, true, 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', NOW(), NOW()),
('clx5d6e7f8g9h0i1j2k3l4m5', 'Emily', 'Rodriguez', 'emily.rodriguez@email.com', '+1234567894', '321 Elm Road, City, State 12345', '1992-11-08', 'TIN789123456', NULL, NULL, false, true, 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', NOW(), NOW()),
('clx6e7f8g9h0i1j2k3l4m5n6', 'XYZ Enterprises', 'Inc', 'info@xyzenterprises.com', '+1234567895', '654 Corporate Blvd, City, State 12345', NULL, 'TIN321654987', 'XYZ Enterprises Inc', 'REG654321', true, true, 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', NOW(), NOW());

-- Add more insurance products
INSERT INTO insurance_products (id, name, description, category, premium, commission, "isActive", "partnerId", "agencyId", "createdAt", "updatedAt") VALUES
('clx2a3b4c5d6e7f8g9h0i1j2', 'Comprehensive Motor Insurance', 'Full coverage for vehicles including theft, damage, and third-party liability', 'Motor', 1500.00, 12.00, true, 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', NOW(), NOW()),
('clx3b4c5d6e7f8g9h0i1j2k3', 'Family Health Insurance', 'Comprehensive health coverage for families including dental and vision', 'Health', 2000.00, 15.00, true, 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', NOW(), NOW()),
('clx4c5d6e7f8g9h0i1j2k3l4', 'Term Life Insurance', 'Affordable life insurance coverage for specified term periods', 'Life', 3000.00, 20.00, true, 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', NOW(), NOW()),
('clx5d6e7f8g9h0i1j2k3l4m5', 'Home Insurance', 'Complete home protection including natural disasters and theft', 'Property', 1800.00, 14.00, true, 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', NOW(), NOW()),
('clx6e7f8g9h0i1j2k3l4m5n6', 'Travel Insurance', 'International travel coverage including medical and trip cancellation', 'Travel', 500.00, 10.00, true, 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', NOW(), NOW());

-- Add more policies with different customers and products
INSERT INTO policies (id, "policyNumber", "customerId", "productId", "partnerId", "salesAgentId", "agencyId", status, "startDate", "endDate", premium, commission, documents, notes, "createdAt", "updatedAt") VALUES
('clx7f8g9h0i1j2k3l4m5n6o7', 'POL-2024-006', 'clx2a3b4c5d6e7f8g9h0i1j2', 'clx2a3b4c5d6e7f8g9h0i1j2', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'ACTIVE', '2024-02-15', '2025-02-15', 1500.00, 180.00, ARRAY['motor_policy_006.pdf'], 'Comprehensive motor insurance for luxury vehicle', NOW(), NOW()),
('clx8g9h0i1j2k3l4m5n6o7p8', 'POL-2024-007', 'clx3b4c5d6e7f8g9h0i1j2k3', 'clx3b4c5d6e7f8g9h0i1j2k3', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'ACTIVE', '2024-03-15', '2025-03-15', 2000.00, 300.00, ARRAY['health_policy_007.pdf'], 'Family health insurance with premium coverage', NOW(), NOW()),
('clx9h0i1j2k3l4m5n6o7p8q9', 'POL-2024-008', 'clx4c5d6e7f8g9h0i1j2k3l4', 'clx4c5d6e7f8g9h0i1j2k3l4', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'ACTIVE', '2024-01-20', '2029-01-20', 3000.00, 600.00, ARRAY['life_policy_008.pdf'], '20-year term life insurance policy', NOW(), NOW()),
('clx0i1j2k3l4m5n6o7p8q9r0', 'POL-2024-009', 'clx5d6e7f8g9h0i1j2k3l4m5', 'clx5d6e7f8g9h0i1j2k3l4m5', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'ACTIVE', '2024-02-01', '2025-02-01', 1800.00, 252.00, ARRAY['home_policy_009.pdf'], 'Comprehensive home insurance for suburban property', NOW(), NOW()),
('clx1j2k3l4m5n6o7p8q9r0s1', 'POL-2024-010', 'clx6e7f8g9h0i1j2k3l4m5n6', 'clx6e7f8g9h0i1j2k3l4m5n6', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 'PENDING', '2024-04-01', '2024-07-01', 500.00, 50.00, ARRAY['travel_policy_010.pdf'], '3-month international travel insurance', NOW(), NOW());

-- Add corresponding sales records
INSERT INTO sales (id, "policyId", "customerId", "salesAgentId", "agencyId", amount, commission, "saleDate", "createdAt", "updatedAt") VALUES
('clx2k3l4m5n6o7p8q9r0s1t2', 'clx7f8g9h0i1j2k3l4m5n6o7', 'clx2a3b4c5d6e7f8g9h0i1j2', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 1500.00, 180.00, '2024-02-15', NOW(), NOW()),
('clx3l4m5n6o7p8q9r0s1t2u3', 'clx8g9h0i1j2k3l4m5n6o7p8', 'clx3b4c5d6e7f8g9h0i1j2k3', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 2000.00, 300.00, '2024-03-15', NOW(), NOW()),
('clx4m5n6o7p8q9r0s1t2u3v4', 'clx9h0i1j2k3l4m5n6o7p8q9', 'clx4c5d6e7f8g9h0i1j2k3l4', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 3000.00, 600.00, '2024-01-20', NOW(), NOW()),
('clx5n6o7p8q9r0s1t2u3v4w5', 'clx0i1j2k3l4m5n6o7p8q9r0', 'clx5d6e7f8g9h0i1j2k3l4m5', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 1800.00, 252.00, '2024-02-01', NOW(), NOW()),
('clx6o7p8q9r0s1t2u3v4w5x6', 'clx1j2k3l4m5n6o7p8q9r0s1', 'clx6e7f8g9h0i1j2k3l4m5n6', 'clx1a2b3c4d5e6f7g8h9i0j1', 'clx1a2b3c4d5e6f7g8h9i0j1', 500.00, 50.00, '2024-04-01', NOW(), NOW());

-- Add more policy reminders
INSERT INTO policy_reminders (id, "policyId", "reminderDate", "isSent", "sentAt", "createdAt", "updatedAt") VALUES
('clx7p8q9r0s1t2u3v4w5x6y7', 'clx7f8g9h0i1j2k3l4m5n6o7', '2025-01-15', false, NULL, NOW(), NOW()),
('clx8q9r0s1t2u3v4w5x6y7z8', 'clx8g9h0i1j2k3l4m5n6o7p8', '2025-02-15', false, NULL, NOW(), NOW()),
('clx9r0s1t2u3v4w5x6y7z8a9', 'clx9h0i1j2k3l4m5n6o7p8q9', '2029-01-20', false, NULL, NOW(), NOW()),
('clx0s1t2u3v4w5x6y7z8a9b0', 'clx0i1j2k3l4m5n6o7p8q9r0', '2025-01-01', false, NULL, NOW(), NOW()),
('clx1t2u3v4w5x6y7z8a9b0c1', 'clx1j2k3l4m5n6o7p8q9r0s1', '2024-06-01', false, NULL, NOW(), NOW());

COMMIT; 