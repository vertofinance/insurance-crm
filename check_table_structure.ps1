# Set the PostgreSQL password as an environment variable
$env:PGPASSWORD = "NewPassword@123"

Write-Host "Checking actual table structure..." -ForegroundColor Yellow

# Check policies table structure
Write-Host "`nPOLICIES table structure:" -ForegroundColor Cyan
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d insurance_crm -c "\d policies" 2>$null

# Check sales table structure
Write-Host "`nSALES table structure:" -ForegroundColor Cyan
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d insurance_crm -c "\d sales" 2>$null

# Check policy_reminders table structure
Write-Host "`nPOLICY_REMINDERS table structure:" -ForegroundColor Cyan
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d insurance_crm -c "\d policy_reminders" 2>$null

# Check insurance_products table structure
Write-Host "`nINSURANCE_PRODUCTS table structure:" -ForegroundColor Cyan
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d insurance_crm -c "\d insurance_products" 2>$null

# Clear the password from environment
$env:PGPASSWORD = $null 