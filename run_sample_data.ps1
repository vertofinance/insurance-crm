# Set the PostgreSQL password as an environment variable
$env:PGPASSWORD = "NewPassword@123"

Write-Host "Adding comprehensive sample data to insurance_crm database..." -ForegroundColor Green

# Execute the SQL file
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d insurance_crm -f "add_missing_sample_data.sql"

# Clear the password from environment
$env:PGPASSWORD = $null

Write-Host "Sample data insertion complete!" -ForegroundColor Green 