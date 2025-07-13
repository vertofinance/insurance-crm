# Set the PostgreSQL password as an environment variable
$env:PGPASSWORD = "NewPassword@123"

Write-Host "=== COMPREHENSIVE DATABASE AUDIT ===" -ForegroundColor Cyan

# 1. Check all tables
Write-Host "`n1. TABLES:" -ForegroundColor Yellow
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d insurance_crm -c "\dt" 2>$null

# 2. Check all views
Write-Host "`n2. VIEWS:" -ForegroundColor Yellow
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d insurance_crm -c "\dv" 2>$null

# 3. Check all triggers
Write-Host "`n3. TRIGGERS:" -ForegroundColor Yellow
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d insurance_crm -c "
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;" 2>$null

# 4. Check all functions
Write-Host "`n4. FUNCTIONS:" -ForegroundColor Yellow
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d insurance_crm -c "
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;" 2>$null

# 5. Check sample data in all tables
Write-Host "`n5. SAMPLE DATA COUNTS:" -ForegroundColor Yellow
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d insurance_crm -c "
SELECT 'agencies' as table_name, COUNT(*) as count FROM agencies
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'insurance_partners', COUNT(*) FROM insurance_partners
UNION ALL
SELECT 'insurance_products', COUNT(*) FROM insurance_products
UNION ALL
SELECT 'policies', COUNT(*) FROM policies
UNION ALL
SELECT 'sales', COUNT(*) FROM sales
UNION ALL
SELECT 'policy_reminders', COUNT(*) FROM policy_reminders
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs
ORDER BY table_name;" 2>$null

# 6. Check if enhanced features exist
Write-Host "`n6. ENHANCED FEATURES CHECK:" -ForegroundColor Yellow

# Check for update_updated_at function
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d insurance_crm -c "
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'update_updated_at') 
        THEN '✅ update_updated_at function exists'
        ELSE '❌ update_updated_at function missing'
    END as status;" 2>$null

# Check for audit logging triggers
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d insurance_crm -c "
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name LIKE '%audit%') 
        THEN '✅ Audit triggers exist'
        ELSE '❌ Audit triggers missing'
    END as status;" 2>$null

# Check for performance views
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d insurance_crm -c "
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'sales_performance_view') 
        THEN '✅ Performance views exist'
        ELSE '❌ Performance views missing'
    END as status;" 2>$null

# Clear the password from environment
$env:PGPASSWORD = $null

Write-Host "`n=== AUDIT COMPLETE ===" -ForegroundColor Cyan 