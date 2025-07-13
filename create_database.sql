-- Insurance CRM Database Creation Script
-- Run this script in pgAdmin or psql

-- Create the database (run this first)
CREATE DATABASE insurance_crm;

-- Connect to the insurance_crm database and run the following:

-- Create UserRole enum
CREATE TYPE "UserRole" AS ENUM ('AGENCY_MANAGER', 'HR_MANAGER', 'SALES_AGENT');

-- Create PolicyStatus enum
CREATE TYPE "PolicyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING');

-- Create agencies table
CREATE TABLE "agencies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on code
CREATE UNIQUE INDEX "agencies_code_key" ON "agencies"("code");

-- Create users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "agencyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on email
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Create customers table
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "tinNumber" TEXT,
    "companyName" TEXT,
    "companyReg" TEXT,
    "isCorporate" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "agencyId" TEXT NOT NULL,
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- Create insurance_partners table
CREATE TABLE "insurance_partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "agencyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_partners_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on code
CREATE UNIQUE INDEX "insurance_partners_code_key" ON "insurance_partners"("code");

-- Create insurance_products table
CREATE TABLE "insurance_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "premium" DECIMAL(10,2) NOT NULL,
    "commission" DECIMAL(5,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "partnerId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_products_pkey" PRIMARY KEY ("id")
);

-- Create policies table
CREATE TABLE "policies" (
    "id" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "salesAgentId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "status" "PolicyStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "premium" DECIMAL(10,2) NOT NULL,
    "commission" DECIMAL(10,2) NOT NULL,
    "documents" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on policyNumber
CREATE UNIQUE INDEX "policies_policyNumber_key" ON "policies"("policyNumber");

-- Create sales table
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "salesAgentId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "commission" DECIMAL(10,2) NOT NULL,
    "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on policyId
CREATE UNIQUE INDEX "sales_policyId_key" ON "sales"("policyId");

-- Create policy_reminders table
CREATE TABLE "policy_reminders" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "reminderDate" TIMESTAMP(3) NOT NULL,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policy_reminders_pkey" PRIMARY KEY ("id")
);

-- Create audit_logs table
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "agencyId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "oldValues" TEXT,
    "newValues" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints

-- Users -> Agency
ALTER TABLE "users" ADD CONSTRAINT "users_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Customers -> Agency
ALTER TABLE "customers" ADD CONSTRAINT "customers_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Customers -> User (assignedTo)
ALTER TABLE "customers" ADD CONSTRAINT "customers_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Insurance Partners -> Agency
ALTER TABLE "insurance_partners" ADD CONSTRAINT "insurance_partners_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insurance Products -> Partner
ALTER TABLE "insurance_products" ADD CONSTRAINT "insurance_products_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "insurance_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insurance Products -> Agency
ALTER TABLE "insurance_products" ADD CONSTRAINT "insurance_products_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Policies -> Customer
ALTER TABLE "policies" ADD CONSTRAINT "policies_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Policies -> Product
ALTER TABLE "policies" ADD CONSTRAINT "policies_productId_fkey" FOREIGN KEY ("productId") REFERENCES "insurance_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Policies -> Partner
ALTER TABLE "policies" ADD CONSTRAINT "policies_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "insurance_partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Policies -> User (salesAgent)
ALTER TABLE "policies" ADD CONSTRAINT "policies_salesAgentId_fkey" FOREIGN KEY ("salesAgentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Policies -> Agency
ALTER TABLE "policies" ADD CONSTRAINT "policies_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Sales -> Policy
ALTER TABLE "sales" ADD CONSTRAINT "sales_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Sales -> Customer
ALTER TABLE "sales" ADD CONSTRAINT "sales_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Sales -> User (salesAgent)
ALTER TABLE "sales" ADD CONSTRAINT "sales_salesAgentId_fkey" FOREIGN KEY ("salesAgentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Sales -> Agency
ALTER TABLE "sales" ADD CONSTRAINT "sales_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Policy Reminders -> Policy
ALTER TABLE "policy_reminders" ADD CONSTRAINT "policy_reminders_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for better performance
CREATE INDEX "users_agencyId_idx" ON "users"("agencyId");
CREATE INDEX "customers_agencyId_idx" ON "customers"("agencyId");
CREATE INDEX "customers_assignedTo_idx" ON "customers"("assignedTo");
CREATE INDEX "insurance_partners_agencyId_idx" ON "insurance_partners"("agencyId");
CREATE INDEX "insurance_products_partnerId_idx" ON "insurance_products"("partnerId");
CREATE INDEX "insurance_products_agencyId_idx" ON "insurance_products"("agencyId");
CREATE INDEX "policies_customerId_idx" ON "policies"("customerId");
CREATE INDEX "policies_productId_idx" ON "policies"("productId");
CREATE INDEX "policies_partnerId_idx" ON "policies"("partnerId");
CREATE INDEX "policies_salesAgentId_idx" ON "policies"("salesAgentId");
CREATE INDEX "policies_agencyId_idx" ON "policies"("agencyId");
CREATE INDEX "policies_status_idx" ON "policies"("status");
CREATE INDEX "sales_policyId_idx" ON "sales"("policyId");
CREATE INDEX "sales_customerId_idx" ON "sales"("customerId");
CREATE INDEX "sales_salesAgentId_idx" ON "sales"("salesAgentId");
CREATE INDEX "sales_agencyId_idx" ON "sales"("agencyId");
CREATE INDEX "policy_reminders_policyId_idx" ON "policy_reminders"("policyId");
CREATE INDEX "policy_reminders_reminderDate_idx" ON "policy_reminders"("reminderDate");
CREATE INDEX "audit_logs_agencyId_idx" ON "audit_logs"("agencyId");
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- Insert sample data (optional)

-- Sample Agency
INSERT INTO "agencies" ("id", "name", "code", "address", "phone", "email", "website", "isActive") 
VALUES ('clx1234567890abcdef', 'Sample Insurance Agency', 'SIA001', '123 Main Street, City, Country', '+1234567890', 'admin@sampleagency.com', 'https://sampleagency.com', true);

-- Sample Admin User (password should be hashed in production)
INSERT INTO "users" ("id", "email", "password", "firstName", "lastName", "phone", "role", "isActive", "agencyId") 
VALUES ('clx1234567890abcdef1', 'admin@sampleagency.com', '$2b$10$hashedpasswordhere', 'Admin', 'User', '+1234567890', 'AGENCY_MANAGER', true, 'clx1234567890abcdef');

-- Sample Insurance Partner
INSERT INTO "insurance_partners" ("id", "name", "code", "address", "phone", "email", "website", "isActive", "agencyId") 
VALUES ('clx1234567890abcdef2', 'Sample Insurance Company', 'SIC001', '456 Insurance Ave, City, Country', '+1234567891', 'contact@sampleinsurance.com', 'https://sampleinsurance.com', true, 'clx1234567890abcdef');

-- Sample Insurance Product
INSERT INTO "insurance_products" ("id", "name", "description", "category", "premium", "commission", "isActive", "partnerId", "agencyId") 
VALUES ('clx1234567890abcdef3', 'Comprehensive Motor Insurance', 'Full coverage motor insurance policy', 'Motor', 500.00, 15.00, true, 'clx1234567890abcdef2', 'clx1234567890abcdef');

-- Sample Customer
INSERT INTO "customers" ("id", "firstName", "lastName", "email", "phone", "address", "isCorporate", "isActive", "agencyId", "assignedTo") 
VALUES ('clx1234567890abcdef4', 'John', 'Doe', 'john.doe@email.com', '+1234567892', '789 Customer St, City, Country', false, true, 'clx1234567890abcdef', 'clx1234567890abcdef1');

COMMIT; 