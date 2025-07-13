# Insurance CRM System

A comprehensive multi-tenant insurance Customer Relationship Management system designed for insurance agencies.

## Features

### Core CRM Features
- **Multi-tenant Architecture**: Isolated data and configurations per agency
- **Customer Management**: Complete customer profiles, contact information, and history
- **Policy Management**: Policy creation, tracking, and 30-day expiry reminders
- **Sales Tracking**: Performance metrics per sales agent
- **Insurance Partners**: Manage relationships with insurance companies
- **Product Catalog**: Insurance products from various partners

### User Management & Roles
- **Agency Manager**: Full system access, manages all staff and operations
- **HR Manager**: Manages staff accounts and permissions only
- **Sales Agent**: Customer and policy management, sales tracking
- **Multi-tenant User Access**: Role-based permissions per agency

### Integration Capabilities
- **TRA Integration**: TIN number verification (optional)
- **BRELA Integration**: Company registration status checking (optional)
- **API Gateway**: Middleware layer for third-party integrations
- **Webhook Support**: Real-time notifications and data sync

## Architecture

```
insurance-crm/
├── frontend/                 # React TypeScript frontend
├── backend/                  # Node.js Express API
├── middleware/               # API Gateway & integrations
├── database/                 # Database schemas and migrations
├── docs/                     # API documentation
└── docker/                   # Docker configuration
```

## Tech Stack

### Frontend
- React 18 with TypeScript
- Material-UI (MUI) for components
- Redux Toolkit for state management
- React Router for navigation
- React Query for API data fetching

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- JWT authentication
- Role-based access control (RBAC)
- Multi-tenant data isolation

### Middleware
- API Gateway for third-party integrations
- Webhook management
- Rate limiting and caching
- Data transformation layer

### DevOps
- Docker containerization
- Environment-based configuration
- Database migrations
- API documentation with Swagger

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables
4. Run database migrations
5. Start the development servers

### Environment Variables

Create `.env` files in each directory:

```env
# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/insurance_crm
JWT_SECRET=your-jwt-secret
PORT=3001

# Frontend
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001

# Middleware
TRA_API_KEY=your-tra-api-key
BRELA_API_KEY=your-brela-api-key
```

## API Documentation

The API documentation is available at `/api/docs` when the backend server is running.

## License

MIT License 