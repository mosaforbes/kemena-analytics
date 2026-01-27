import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config.js';
import artistRoutes from './routes/artists.js';
import syncRoutes from './routes/sync.js';
import { syncAllData } from './services/syncService.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: config.FRONTEND_URL,
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/artists', artistRoutes);
app.use('/api/sync', syncRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Kemena Analytics Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      artists: '/api/artists',
      sync: '/api/sync'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const server = app.listen(config.PORT, () => {
  console.log(`🚀 Kemena Analytics Backend running on port ${config.PORT}`);
  console.log(`📊 Environment: ${config.NODE_ENV}`);
  console.log(`🎵 Artist: ${config.ARTIST_NAME}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
