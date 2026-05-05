require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');

const { connectPostgres } = require('./config/db.postgres');
const { connectMongo } = require('./config/db.mongo');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

// Routes
const authRoutes = require('./routes/auth.routes');
const vendorRoutes = require('./routes/vendor.routes');
const panchayatRoutes = require('./routes/panchayat.routes');
const deviceRoutes = require('./routes/device.routes');
const technicianRoutes = require('./routes/technician.routes');
const enquiryRoutes = require('./routes/enquiry.routes');
const complaintRoutes = require('./routes/complaint.routes');
const officerRoutes = require('./routes/officer.routes');
const aiCallLogRoutes = require('./routes/aiCallLog.routes');

const app = express();

app.set('trust proxy', 1);

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['https://unstable-follow-quarrel.ngrok-free.dev'];

app.use(
  cors({
    origin(origin, callback) {
      // Allow Postman, curl, server-to-server, mobile apps
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Prevent NoSQL injection patterns in Mongo queries
//app.use(mongoSanitize());

// Prevent HTTP parameter pollution
//app.use(hpp());

// Compression
app.use(compression());

// Request logger
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

// Strict auth limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

app.use(generalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TREDA API is running',
  });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);

app.use('/api/vendors', vendorRoutes);
app.use('/api/panchayats', panchayatRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/officers', officerRoutes);
app.use('/api/ai-call-logs', aiCallLogRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Central error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectPostgres();
    await connectMongo();

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`TREDA server running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();