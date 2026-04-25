require('dotenv').config();

const express   = require('express');
const helmet    = require('helmet');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');

const { connectPostgres, sequelize } = require('./config/db.postgres');
const {connectMongo}    = require('./config/db.mongo');
const errorHandler    = require('./middlewares/errorHandler');
const logger          = require('./utils/logger');

// ── Routes ────────────────────────────────────────────
const authRoutes       = require('./routes/auth.routes');
const vendorRoutes     = require('./routes/vendor.routes');
const customerRoutes   = require('./routes/customer.routes');
const deviceRoutes     = require('./routes/device.routes');
const technicianRoutes = require('./routes/technician.routes');
const enquiryRoutes    = require('./routes/enquiry.routes');
const complaintRoutes  = require('./routes/complaint.routes');
const officerRoutes    = require('./routes/officer.routes');
const aiCallLogRoutes  = require('./routes/aiCallLog.routes');

const app = express();

// ── Security middleware ───────────────────────────────
// app.use(helmet());

// app.use(cors({
//   origin: process.env.ALLOWED_ORIGINS
//     ? process.env.ALLOWED_ORIGINS.split(',')
//     : 'http://localhost:3000',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
// }));

// ── Request logger ────────────────────────────────────
app.use((req, res, next) => {
    console.log("🔥 REQUEST HIT:", req.method, req.url);

  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// ── General rate limiter (all routes) ─────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 100,                    // 100 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// ── Strict rate limiter (auth routes only) ────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 100,                     // only 10 login attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try after 15 minutes.' },
});


//app.use(express.json({ limit: '10kb' }));         // parse JSON, limit payload size
app.use(cors());
app.use(express.json());      // SECOND

app.use(express.urlencoded({ extended: false }));
app.use(helmet({
  crossOriginResourcePolicy: false,
}));


// ── Health check ──────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'TREDA API is running' });
});

// ── API routes ────────────────────────────────────────
//app.use('/api/auth',        authLimiter, authRoutes);

//app.use(generalLimiter);
// apply general limiter AFTER auth
app.use('/api/auth', authRoutes);

app.use('/api/vendors',     vendorRoutes);
app.use('/api/customers',   customerRoutes);
app.use('/api/devices',     deviceRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/enquiries',   enquiryRoutes);
app.use('/api/complaints',  complaintRoutes);
app.use('/api/officers',    officerRoutes);
app.use('/api/ai-call-logs', aiCallLogRoutes);

// ── 404 handler ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Central error handler (must be last) ──────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────
const PORT = process.env.PORT || 5001;

const startServer = async () => {

  try {
    await connectPostgres();
    await connectMongo();

    require('./models/pg'); // registers all models + associations
//await sequelize.sync();
    // app.listen(PORT, () => {
    //   logger.info(`TREDA server running on port ${PORT} [${process.env.NODE_ENV}]`);
    // });
    app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on https://treda-backend-87yc.onrender.com:${PORT}`);
});
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();