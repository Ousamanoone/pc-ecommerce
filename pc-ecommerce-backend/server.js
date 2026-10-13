const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);

// 1. Cấu hình Socket.io
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
});

// 2. CORS đặt đầu tiên
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Helmet & Lọc NoSQL Injection
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

const sanitizeNoSQL = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitizeNoSQL(obj[key]);
    }
  }
};

app.use((req, res, next) => {
  if (req.body) sanitizeNoSQL(req.body);
  if (req.params) sanitizeNoSQL(req.params);
  if (req.query) sanitizeNoSQL(req.query);
  next();
});

// 4. Parsers & Thư mục ảnh tĩnh
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. Rate limit đăng nhập
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/auth/login', authLimiter);

// 6. Kết nối Database
const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      'mongodb://127.0.0.1:27017/pc-ecommerce';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
  }
};
connectDB();

// Route kiểm tra trạng thái server trên Render
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'GearStore API is running' });
});

// 7. Nạp Routes an toàn
const mountRoute = (prefix, relativePath) => {
  const fullPath = path.join(__dirname, relativePath + '.js');
  if (fs.existsSync(fullPath)) {
    try {
      app.use(prefix, require(relativePath));
    } catch (err) {
      console.error(`❌ Lỗi nạp route [${prefix}] từ file [${relativePath}]:`, err.message);
    }
  }
};

mountRoute('/api/v1/auth', './src/routes/authRoutes');
mountRoute('/api/v1/products', './src/routes/productRoutes');
mountRoute('/api/v1/orders', './src/routes/orderRoutes');
mountRoute('/api/v1/users', './src/routes/userRoutes');
mountRoute('/api/v1/notifications', './src/routes/notificationRoutes');
mountRoute('/api/v1/blogs', './src/routes/blogRoutes');
mountRoute('/api/v1/reviews', './src/routes/reviewRoutes');
mountRoute('/api/v1/coupons', './src/routes/couponRoutes');
mountRoute('/api/v1/banners', './src/routes/bannerRoutes');
mountRoute('/api/v1/dashboard', './src/routes/dashboardRoutes');
mountRoute('/api/v1/chat', './src/routes/chatRoutes');
mountRoute('/api/v1/conversations', './src/routes/conversationRoutes');
mountRoute('/api/v1/messages', './src/routes/messageRoutes');
mountRoute('/api/v1/upload', './src/routes/uploadRoutes');
mountRoute('/api/v1/media', './src/routes/mediaRoutes');

// 8. Lắng nghe server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server & Socket.io running on http://localhost:${PORT}`);
});