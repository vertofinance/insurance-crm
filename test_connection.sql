-- Simple connection test
SELECT 'Database connection successful!' as status;
SELECT current_database() as current_db;
SELECT version() as postgres_version; 