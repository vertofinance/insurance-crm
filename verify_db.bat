@echo off
echo Checking database tables...
cd "C:\Program Files\PostgreSQL\17\bin"
psql.exe -U postgres -h localhost -d insurance_crm -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" -W
echo.
echo Checking database views...
psql.exe -U postgres -h localhost -d insurance_crm -c "SELECT table_name FROM information_schema.views WHERE table_schema = 'public' ORDER BY table_name;" -W
echo.
echo Checking database functions...
psql.exe -U postgres -h localhost -d insurance_crm -c "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' ORDER BY routine_name;" -W
pause 