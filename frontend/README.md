# Insurance CRM Frontend

A modern React-based frontend for the Insurance CRM system, built with Material-UI, Redux Toolkit, and TypeScript.

## Features

- 🎨 **Modern UI/UX**: Beautiful Material-UI design with responsive layout
- 🔐 **Authentication**: Secure login/logout with JWT tokens
- 📊 **Dashboard**: Comprehensive analytics and overview
- 👥 **Customer Management**: Full CRUD operations for customers
- 📋 **Policy Management**: Insurance policy lifecycle management
- 🤝 **Partner Management**: Insurance partner and agency management
- 📦 **Product Management**: Insurance product catalog
- 💰 **Sales Tracking**: Sales performance and commission tracking
- 👤 **User Management**: Role-based access control
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🔄 **Real-time Updates**: WebSocket integration for live updates

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **Redux Toolkit** - State management
- **React Query** - Server state management
- **React Router** - Navigation
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Socket.io** - Real-time communication

## Prerequisites

- Node.js 16+ and npm
- Backend API running on `http://localhost:3001`

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:3001
   REACT_APP_WS_URL=ws://localhost:3001
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main layout with navigation
├── pages/              # Page components
│   ├── Login.tsx       # Authentication page
│   ├── Dashboard.tsx   # Analytics dashboard
│   ├── Customers.tsx   # Customer management
│   ├── Policies.tsx    # Policy management
│   ├── Partners.tsx    # Partner management
│   ├── Products.tsx    # Product management
│   ├── Sales.tsx       # Sales tracking
│   ├── Users.tsx       # User management
│   └── Profile.tsx     # User profile
├── store/              # Redux store
│   ├── index.ts        # Store configuration
│   └── slices/         # Redux slices
│       ├── authSlice.ts
│       ├── customerSlice.ts
│       ├── policySlice.ts
│       ├── partnerSlice.ts
│       ├── productSlice.ts
│       ├── saleSlice.ts
│       └── userSlice.ts
├── services/           # API services
│   └── authService.ts  # Authentication service
├── theme.ts            # Material-UI theme
├── App.tsx             # Main app component
└── index.tsx           # App entry point
```

## Authentication

The application uses JWT tokens for authentication. The auth flow includes:

1. **Login**: User enters credentials
2. **Token Storage**: JWT token stored in localStorage
3. **Auto-login**: Token automatically included in API requests
4. **Token Refresh**: Automatic token refresh on expiration
5. **Logout**: Token removal and redirect to login

## Demo Credentials

For testing purposes, use these demo credentials:
- **Email**: `admin@insurance.com`
- **Password**: `password123`

## API Integration

The frontend connects to the backend API with the following endpoints:

- **Authentication**: `/api/auth/*`
- **Customers**: `/api/customers/*`
- **Policies**: `/api/policies/*`
- **Partners**: `/api/partners/*`
- **Products**: `/api/products/*`
- **Sales**: `/api/sales/*`
- **Users**: `/api/users/*`
- **Dashboard**: `/api/dashboard/*`

## State Management

The application uses Redux Toolkit for global state management:

- **Auth State**: User authentication and session
- **Customer State**: Customer data and operations
- **Policy State**: Policy management
- **Partner State**: Partner/agency data
- **Product State**: Product catalog
- **Sale State**: Sales tracking
- **User State**: User management

## Styling

The application uses Material-UI with a custom theme that includes:

- **Color Palette**: Professional blue and red theme
- **Typography**: Roboto font family
- **Components**: Customized buttons, cards, and forms
- **Responsive Design**: Mobile-first approach

## Development

### Adding New Features

1. **Create Redux slice** in `src/store/slices/`
2. **Add API service** in `src/services/`
3. **Create page component** in `src/pages/`
4. **Add route** in `src/App.tsx`
5. **Update navigation** in `src/components/Layout.tsx`

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations

## Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Serve the build folder** using a static file server

3. **Set production environment variables** for API endpoints

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend allows requests from frontend origin
2. **API Connection**: Verify backend is running on correct port
3. **Build Errors**: Check for missing dependencies
4. **Type Errors**: Ensure TypeScript types are properly defined

### Performance Optimization

- Use React.memo for expensive components
- Implement proper loading states
- Optimize bundle size with code splitting
- Use React Query for efficient data fetching

## Contributing

1. Follow the existing code style
2. Add proper TypeScript types
3. Include error handling
4. Test your changes
5. Update documentation

## License

This project is part of the Insurance CRM system. 