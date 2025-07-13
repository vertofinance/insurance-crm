# Insurance CRM System - Setup Guide

This guide will help you set up the complete Insurance CRM system on your local machine.

## Prerequisites

### Required Software
1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **PostgreSQL** (v14 or higher)
   - Download from: https://www.postgresql.org/download/
   - Create a database named `insurance_crm`

3. **Git** (for version control)
   - Download from: https://git-scm.com/

### Optional Software
- **Docker** (for containerized deployment)
- **Postman** (for API testing)
- **VS Code** (recommended IDE)

## Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd insurance-crm
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install middleware dependencies
cd ../middleware
npm install

# Return to root
cd ..
```

### 3. Environment Configuration

#### Backend Environment (.env)
Create `backend/.env`:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/insurance_crm"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Server
PORT=3001
NODE_ENV=development

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Third-party API Keys (Optional)
TRA_API_KEY=your-tra-api-key
BRELA_API_KEY=your-brela-api-key
```

#### Frontend Environment (.env)
Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001
REACT_APP_MIDDLEWARE_URL=http://localhost:3002
```

#### Middleware Environment (.env)
Create `middleware/.env`:
```env
MIDDLEWARE_PORT=3002
NODE_ENV=development

# Third-party API Keys
TRA_API_KEY=your-tra-api-key
BRELA_API_KEY=your-brela-api-key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Database Setup

#### Generate Prisma Client
```bash
cd backend
npx prisma generate
```

#### Run Database Migrations
```bash
npx prisma migrate dev --name init
```

#### Seed Database (Optional)
```bash
npm run db:seed
```

### 5. Start the Application

#### Development Mode
```bash
# From root directory
npm run dev
```

This will start:
- Backend API on http://localhost:3001
- Frontend on http://localhost:3000
- Middleware on http://localhost:3002

#### Individual Services
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend

# Middleware only
npm run dev:middleware
```

## Initial Setup

### 1. Create First Agency and Admin User

After starting the backend, you'll need to create the first agency and admin user. You can do this through the API or by running the seed script.

#### Using API (Recommended)
```bash
# Create agency
curl -X POST http://localhost:3001/api/agencies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Insurance Agency",
    "code": "YIA001",
    "address": "123 Main St, City, Country",
    "phone": "+1234567890",
    "email": "admin@youragency.com"
  }'

# Create admin user (you'll need to implement this endpoint)
curl -X POST http://localhost:3001/api/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@youragency.com",
    "password": "securepassword123",
    "firstName": "Admin",
    "lastName": "User",
    "agencyId": "agency-id-from-previous-step"
  }'
```

### 2. Access the Application

1. Open your browser and go to http://localhost:3000
2. Log in with the admin credentials you created
3. Start using the CRM system!

## API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: http://localhost:3001/api/docs
- Health Check: http://localhost:3001/health

## Features Overview

### Core Features
- ✅ Multi-tenant architecture
- ✅ User management with role-based access
- ✅ Customer management
- ✅ Policy management with expiry reminders
- ✅ Insurance partner management
- ✅ Product catalog
- ✅ Sales tracking
- ✅ Automated email notifications

### User Roles
- **Agency Manager**: Full system access
- **HR Manager**: User management only
- **Sales Agent**: Customer and policy management

### Integrations (Optional)
- TRA TIN verification
- BRELA company registration verification
- Email notifications
- WebSocket real-time updates

## Troubleshooting

### Common Issues

#### 1. Database Connection Error
```bash
# Check if PostgreSQL is running
# Windows: Check Services
# Mac/Linux: sudo systemctl status postgresql

# Verify connection string in .env
DATABASE_URL="postgresql://username:password@localhost:5432/insurance_crm"
```

#### 2. Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :3001  # Windows
lsof -i :3001                 # Mac/Linux

# Kill the process or change port in .env
```

#### 3. Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Prisma Issues
```bash
# Reset Prisma
npx prisma migrate reset
npx prisma generate
npx prisma db push
```

### Getting Help

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all prerequisites are installed
4. Check the API documentation at http://localhost:3001/api/docs

## Production Deployment

For production deployment, consider:

1. **Environment Variables**: Use proper production values
2. **Database**: Use a managed PostgreSQL service
3. **Email**: Configure a production SMTP service
4. **Security**: Use HTTPS, proper JWT secrets, and rate limiting
5. **Monitoring**: Set up logging and monitoring
6. **Backup**: Configure database backups
7. **SSL**: Set up SSL certificates

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the console logs
3. Verify your environment configuration
4. Ensure all dependencies are properly installed

## License

This project is licensed under the MIT License. 