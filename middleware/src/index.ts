import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';
import { traService } from './services/traService';
import { brelaService } from './services/brelaService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.MIDDLEWARE_PORT || 3002;

// Configure Winston logger
const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(compression());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// TRA Integration Routes
app.post('/api/tra/verify-tin', async (req, res) => {
  try {
    const { tinNumber } = req.body;
    
    if (!tinNumber) {
      return res.status(400).json({
        success: false,
        message: 'TIN number is required'
      });
    }

    const result = await traService.verifyTIN(tinNumber);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('TRA TIN verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify TIN number'
    });
  }
});

// BRELA Integration Routes
app.post('/api/brela/verify-company', async (req, res) => {
  try {
    const { companyRegNumber } = req.body;
    
    if (!companyRegNumber) {
      return res.status(400).json({
        success: false,
        message: 'Company registration number is required'
      });
    }

    const result = await brelaService.verifyCompany(companyRegNumber);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('BRELA company verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify company registration'
    });
  }
});

// Webhook endpoint for receiving notifications
app.post('/api/webhooks/:provider', (req, res) => {
  try {
    const { provider } = req.params;
    const payload = req.body;
    
    logger.info(`Webhook received from ${provider}`, { payload });
    
    // Process webhook based on provider
    switch (provider) {
      case 'tra':
        // Handle TRA webhook
        break;
      case 'brela':
        // Handle BRELA webhook
        break;
      default:
        logger.warn(`Unknown webhook provider: ${provider}`);
    }
    
    res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook'
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Middleware server running on port ${PORT}`);
  logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
}); 