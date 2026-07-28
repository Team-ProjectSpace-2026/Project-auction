import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import configureCloudinary from './src/config/cloudinary.js';
import { initializeSocket } from './src/socket/auctionSocket.js';

// Import routes
import authRoutes from './src/routes/auth.routes.js';
import tournamentRoutes from './src/routes/tournament.routes.js';
import playerRoutes from './src/routes/player.routes.js';
import teamRoutes from './src/routes/team.routes.js';
import auctionRoutes from './src/routes/auction.routes.js';
import dashboardRoutes from './src/routes/dashboard.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';

// Import middleware
import { errorHandler } from './src/middleware/errorHandler.js';
import { xssSanitize } from './src/middleware/sanitize.js';
import { csrfProtection } from './src/middleware/csrf.middleware.js';
import logger from './src/utils/logger.js';

// Load environment variables
dotenv.config();

// Configure Cloudinary
configureCloudinary();

// --- Startup validation: fail fast if critical secrets are missing ---
const requiredEnvVars = ['JWT_SECRET', 'MONGO_URI'];
const missing = requiredEnvVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be at least 32 characters');
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1);
const server = createServer(app);
const PORT = process.env.PORT || 5000;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Connect to database
await connectDB();

// --- Security headers via Helmet ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", SERVER_URL, CLIENT_URL, "https://*.razorpay.com"],
      connectSrc: ["'self'", "https://lumberjack.razorpay.com", "https://api.razorpay.com"],
      frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

// CORS with strict origin validation
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, curl, Render health checks)
    if (!origin) {
      return callback(null, true);
    }
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(origin) || allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(cookieParser());
// CSRF protection middleware for cookie authentication
app.use(csrfProtection);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// XSS sanitization for all request bodies
app.use(xssSanitize);

// Rate limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Request logging
app.use(logger.requestMiddleware);

// Root endpoint for status and deployment health checks
app.get('/', (req, res) => {
  res.json({
    name: 'CricAuction API Server',
    status: 'Running',
    version: '1.0.0',
    health: '/api/health'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/teams', express.json({ limit: '10mb' }), teamRoutes);
app.use('/api/auction', auctionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payment', paymentRoutes);

// Health check endpoint with dependency checks
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {},
  };

  // Check MongoDB connectivity
  try {
    const state = mongoose.connection.readyState;
    // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    health.services.mongodb = state === 1 ? 'connected' : 'unavailable';
  } catch {
    health.services.mongodb = 'error';
  }

  // Check Socket.IO
  health.services.socketio = io ? 'initialized' : 'not initialized';

  // Overall status
  if (health.services.mongodb !== 'connected') {
    health.status = 'DEGRADED';
    return res.status(503).json(health);
  }

  res.json(health);
});

// Error handling middleware
app.use(errorHandler);

// Initialize Socket.IO
const io = initializeSocket(server);

// Start server
server.listen(PORT, () => {
  const env = process.env.NODE_ENV || "development";
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  console.log("");
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║                                                          ║");
  console.log("║             🏏  CricAuction Server  🏏                  ║");
  console.log("║                                                          ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log(`║  Status:    ✓ Running                                    ║`);
  console.log(`║  Port:      ${PORT}                                        ║`);
  console.log(`║  Environment: ${env.padEnd(43)}║`);
  console.log(`║  Server:    ${SERVER_URL.padEnd(43)}║`);
  console.log(`║  Client:    ${clientUrl.padEnd(43)}║`);
  console.log("║                                                          ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log("║  API Endpoints:                                          ║");
  console.log("║    • Auth:         /api/auth                             ║");
  console.log("║    • Tournaments:  /api/tournaments                      ║");
  console.log("║    • Players:      /api/players                          ║");
  console.log("║    • Teams:        /api/teams                            ║");
  console.log("║    • Auction:      /api/auction                          ║");
  console.log("║    • Dashboard:    /api/dashboard                        ║");
  console.log("║    • Health:       /api/health                           ║");
  console.log("║                                                          ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log("");
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});