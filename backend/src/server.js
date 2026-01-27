import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config.js';
import artistRoutes from './routes/artists.js';
import syncRoutes from './routes/sync.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS - allow any origin in development, restrict in production
app.use(cors({
  origin: config.NODE_ENV === 'production' ? config.FRONTEND_URL : '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());

// Health check - always works
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    artist: config.ARTIST_NAME
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Kemena Analytics Backend API',
    version: '1.0.0',
    status: 'running',
    environment: config.NODE_ENV,
    endpoints: {
      health: '/health',
      artists: '/api/artists',
      sync: '/api/sync'
    },
    message: 'Backend is online and ready!'
  });
});

// API Routes (wrap in try-catch in case DB isn't ready)
try {
  app.use('/api/artists', artistRoutes);
  app.use('/api/sync', syncRoutes);
} catch (err) {
  console.warn('⚠️  API routes loaded with warnings:', err.message);
  // Still allow health checks even if routes fail
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// Start server with error handling
const PORT = config.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Kemena Analytics Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${config.NODE_ENV}`);
  console.log(`🎵 Artist: ${config.ARTIST_NAME}`);
  console.log(`✅ Server is ready to accept requests`);
});

// Error handling for server startup
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
