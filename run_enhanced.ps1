# PowerShell script to run enhanced database script
Write-Host "Running enhanced database script..." -ForegroundColor Green

$env:PGPASSWORD = "NewPassword@123"

try {
    # Run the enhanced script
    Write-Host "Adding triggers, views, functions, and sample data..." -ForegroundColor Yellow
    & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -d insurance_crm -f "C:\Users\ericl\code\insurance-crm\create_database_enhanced.sql"
    
    Write-Host "Enhanced script completed!" -ForegroundColor Green
    
    # Verify the results
    Write-Host "`nVerifying results..." -ForegroundColor Yellow
    
    Write-Host "`nChecking views..." -ForegroundColor Cyan
    & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -d insurance_crm -c "SELECT table_name FROM information_schema.views WHERE table_schema = 'public' ORDER BY table_name;"
    
    Write-Host "`nChecking functions..." -ForegroundColor Cyan
    & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -d insurance_crm -c "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' ORDER BY routine_name;"
    
    Write-Host "`nChecking triggers..." -ForegroundColor Cyan
    & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -d insurance_crm -c "SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public' ORDER BY trigger_name;"
    
    Write-Host "`nChecking sample data..." -ForegroundColor Cyan
    & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -d insurance_crm -c "SELECT 'agencies' as table_name, COUNT(*) as count FROM agencies UNION ALL SELECT 'users', COUNT(*) FROM users UNION ALL SELECT 'customers', COUNT(*) FROM customers UNION ALL SELECT 'insurance_partners', COUNT(*) FROM insurance_partners UNION ALL SELECT 'insurance_products', COUNT(*) FROM insurance_products UNION ALL SELECT 'policies', COUNT(*) FROM policies UNION ALL SELECT 'sales', COUNT(*) FROM sales;"
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nPress any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 