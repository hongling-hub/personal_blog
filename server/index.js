require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errors } = require('celebrate');
const winston = require('winston');
const app = express();

// 1. 初始化日志记录器
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// 2. 连接MongoDB
mongoose.connect('mongodb://localhost:27017/blog_db')
  .then(() => console.log('MongoDB连接成功'))
  .catch(err => console.error('MongoDB连接失败:', err)); // 修复错误变量名

// 3. 中间件配置
app.use(helmet()); // 安全相关HTTP头
app.use(morgan('dev')); // 请求日志
app.use(express.json({ limit: '10kb' })); // 替换bodyParser
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. 会话配置（用于验证码）
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/blog_db' }),
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 1天
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// 5. CORS配置（根据前端端口调整）
app.use(cors({
  origin: 'http://localhost:5173', // 改为您的前端开发端口
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// 6. 速率限制（防止暴力攻击）
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 每个IP限制100个请求
});
app.use('/api/auth', limiter);

// 7. 路由挂载
app.use('/api/auth', require('./routes/auth'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/admin', require('./routes/admin'));

// 8. 健康检查端点
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    dbState: mongoose.connection.readyState,
    timestamp: new Date() 
  });
});
// server/index.js
app.get('/api/test', (req, res) => {
  res.json({ message: "Backend API is working!" });
});

// 9. 错误处理中间件
app.use(errors()); // Joi验证错误
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ 
    message: process.env.NODE_ENV === 'development' ? 
      err.message : 'Internal Server Error' 
  });
});

// 10. 404处理
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// 11. 启动服务器
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// 12. 优雅关闭
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app; // 用于测试

