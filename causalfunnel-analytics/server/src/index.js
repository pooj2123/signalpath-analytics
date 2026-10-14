import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import eventRoutes from './routes/events.js';

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',').map(origin => origin.trim()).filter(Boolean);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"], scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
    imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"]
  } }
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || origins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '64kb' }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX) || 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false
}));

app.get('/api/health', (_req, res) => {
  res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
    status: mongoose.connection.readyState === 1 ? 'ok' : 'database_unavailable',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
app.use('/api/events', eventRoutes);
app.get('/tracker.js', (_req, res) => {
  res.type('application/javascript').sendFile(path.resolve(__dirname, '../public/tracker.js'));
});
app.use((req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` }));
app.use((error, _req, res, _next) => {
  console.error('[api]', error.message);
  const status = error.message?.includes('CORS') ? 403 : 500;
  res.status(status).json({ error: status === 500 ? 'An unexpected server error occurred.' : error.message });
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/signalpath')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`SignalPath API listening on http://localhost:${PORT}`));
  })
  .catch(error => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
