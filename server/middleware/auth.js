const jwt = require('jsonwebtoken');
const User = require('../models/User');


// 身份验证中间件
const authenticate = async (req, res, next) => {
  try {
    // 获取Authorization头
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '请先登录' });
    }

    // 提取token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '请先登录' });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // 查找用户
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '无效的token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'token已过期' });
    }
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = { authenticate };