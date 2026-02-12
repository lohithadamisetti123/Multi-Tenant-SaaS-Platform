const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import Database Config for Health Check
const sequelize = require('./config/database');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const tenantRoutes = require('./routes/tenantRoutes');

const app = express();

// Middleware
app.use(helmet());
// Configure CORS to allow both the Docker-internal frontend hostname
// (e.g. http://frontend:3000) and the host machine during local dev
// (http://localhost:3000). This accepts either value from the
// FRONTEND_URL env var and always allows localhost for developer testing.
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:3000'].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    // If no origin (server-to-server requests, curl, etc.) allow it
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: origin not allowed'));
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Health Check Endpoint (UPDATED)
app.get('/api/health', async (req, res) => {
  try {
    // Attempt to connect to the database
    await sequelize.authenticate();
    // Only return 200 if DB connection succeeds
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health Check Failed:', error);
    // Return 503 Service Unavailable if DB is down
    res.status(503).json({ 
      status: 'error', 
      database: 'disconnected', 
      error: error.message 
    });
  }
});

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tenants', tenantRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;