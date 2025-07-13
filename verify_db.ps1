# Set the PostgreSQL password as an environment variable
$env:PGPASSWORD = "NewPassword@123"

# Connect to database and run verification queries
Write-Host "Connecting to PostgreSQL database..." -ForegroundColor Green

# Test connection and show version
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d insurance_crm -c "SELECT version();" 2>$null

# Show all tables
Write-Host "`nDatabase tables:" -ForegroundColor Yellow
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d insurance_crm -c "\dt" 2>$null

# Show table counts
Write-Host "`nTable record counts:" -ForegroundColor Yellow
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
SELECT 'audit_logs', COUNT(*) FROM audit_logs;" 2>$null

# Clear the password from environment
$env:PGPASSWORD = $null

Write-Host "`nDatabase verification complete!" -ForegroundColor Green 