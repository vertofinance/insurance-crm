# PowerShell script to check database
Write-Host "Checking database connection..." -ForegroundColor Green

$env:PGPASSWORD = "NewPassword@123"

try {
    # Check if database exists
    $result = & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -c "SELECT datname FROM pg_database WHERE datname = 'insurance_crm';" 2>$null
    
    if ($result -match "insurance_crm") {
        Write-Host "Database 'insurance_crm' exists!" -ForegroundColor Green
        
        # Check tables
        Write-Host "`nChecking tables..." -ForegroundColor Yellow
        & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -d insurance_crm -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
        
        # Check views
        Write-Host "`nChecking views..." -ForegroundColor Yellow
        & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -d insurance_crm -c "SELECT table_name FROM information_schema.views WHERE table_schema = 'public' ORDER BY table_name;"
        
        # Check functions
        Write-Host "`nChecking functions..." -ForegroundColor Yellow
        & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -d insurance_crm -c "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' ORDER BY routine_name;"
        
    } else {
        Write-Host "Database 'insurance_crm' does not exist!" -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nPress any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 