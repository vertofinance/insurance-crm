@echo off
cd "C:\Program Files\PostgreSQL\17\bin"
echo Checking database tables...
psql.exe -U postgres -h localhost -d insurance_crm -c "\dt" -W
echo.
echo Checking database views...
psql.exe -U postgres -h localhost -d insurance_crm -c "\dv" -W
echo.
echo Checking database functions...
psql.exe -U postgres -h localhost -d insurance_crm -c "\df" -W
pause 