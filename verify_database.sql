-- Database Verification Script
-- This script checks if all tables, views, functions, and triggers were created

-- Check tables
SELECT 'Tables' as object_type, table_name as object_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check views
SELECT 'Views' as object_type, table_name as object_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check functions
SELECT 'Functions' as object_type, routine_name as object_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;

-- Check triggers
SELECT 'Triggers' as object_type, trigger_name as object_name 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
ORDER BY trigger_name;

-- Check indexes
SELECT 'Indexes' as object_type, indexname as object_name 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;

-- Count records in main tables
SELECT 'Record Counts' as info, 'agencies' as table_name, COUNT(*) as count FROM agencies
UNION ALL
SELECT 'Record Counts', 'users', COUNT(*) FROM users
UNION ALL
SELECT 'Record Counts', 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'Record Counts', 'insurance_partners', COUNT(*) FROM insurance_partners
UNION ALL
SELECT 'Record Counts', 'insurance_products', COUNT(*) FROM insurance_products
UNION ALL
SELECT 'Record Counts', 'policies', COUNT(*) FROM policies
UNION ALL
SELECT 'Record Counts', 'sales', COUNT(*) FROM sales; 