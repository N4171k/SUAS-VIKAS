require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB, sequelize } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import models to register associations
require('./models');

const app = express();
const server = http.createServer(app);

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'VIKAS Backend' });
});

// Error handler
app.use(errorHandler);

// Socket.IO events
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('join-store', (storeId) => {
    socket.join(`store-${storeId}`);
    console.log(`📍 Client ${socket.id} joined store-${storeId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync();
    console.log('✅ Database synced');

    server.listen(PORT, () => {
      console.log(`🚀 VIKAS Backend running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
