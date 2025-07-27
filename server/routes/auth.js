const express = require('express');
const router = express.Router();
const User = require('../models/User');
const svgCaptcha = require('svg-captcha');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// 配置multer存储
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads/avatars');
    // 确保目录存在
    require('fs').mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

// 文件过滤
const fileFilter = (req, file, cb) => {
  // 只接受图片文件
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// 生成验证码
router.get('/captcha', (req, res) => {
  const captcha = svgCaptcha.create({
    size: 4,
    noise: 2,
    color: true,
  });
  req.session.captcha = captcha.text;
  res.type('svg');
  res.status(200).send(captcha.data);
});

// 用户登录
router.post('/login', async (req, res) => {
  const { username, password, captcha } = req.body;
  
  console.log('登录请求:', { username, captcha: captcha ? '已提供' : '未提供' });
  console.log('Session验证码:', req.session.captcha);
  
  // 验证验证码
  if (captcha.toLowerCase() !== req.session.captcha.toLowerCase()) {
    console.log('验证码不匹配:', { 输入: captcha, 预期: req.session.captcha });
    return res.status(400).json({ message: '验证码错误' });
  }
  
  // 验证用户
  console.log('查询用户:', username);
  const user = await User.findOne({ username });
  if (!user) {
    console.log('用户不存在:', username);
    return res.status(401).json({ message: '用户不存在' });
  }
  
  console.log('验证密码...');
  const isValidPassword = user.validPassword(password);
  if (!isValidPassword) {
    console.log('密码验证失败:', username);
    return res.status(401).json({ message: '用户名或密码错误' });
  }
  
  // 生成JWT
  const token = jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET || 'your-secret-key',
  { expiresIn: '2h' }
);
  
  res.json({ 
    success: true,
    token,
    message: '登录成功'
  });
});

router.post('/register', async (req, res) => {
  console.log('注册请求:', req.body);
  try {
    const { username, password, captcha } = req.body;
    
    console.log('检查用户是否存在:', username);
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('用户名已存在:', username);
      return res.status(400).json({ message: '当前用户名已被注册' });
    }
    
    console.log('创建新用户:', username);
    const newUser = new User({ username });
    
    console.log('设置密码...');
    newUser.password = password;
    await newUser.save();
    
    res.status(201).json({ message: '注册成功' });
  } catch (err) {
  console.error('注册错误:', err.stack);
  // 检查是否是MongoDB重复键错误
  if (err.code === 11000 && err.keyPattern && err.keyPattern.username) {
    return res.status(400).json({ message: '当前用户名已被注册' });
  }
  res.status(500).json({ 
    message: '注册失败', 
    error: process.env.NODE_ENV === 'development' ? err.message : null
  });
}
});

const { authenticate } = require('../middleware/auth');

// 获取当前用户信息
router.get('/me', authenticate, async (req, res) => {
  try {
    // 从请求对象中获取用户信息（由auth中间件设置）
    const user = req.user;
    res.json({
      id: user._id,
      username: user.username,
      avatar: user.avatar,
      joinDate: user.createdAt,
      stats: {
          followers: user.followers?.length || 0,
          following: user.following?.length || 0,
          collections: user.collections?.length || 0,
          tags: user.tags?.length || 0,
          likes: user.likes?.length || 0,
          posts: user.posts?.length || 0
        }
    });
  } catch (error) {
    res.status(500).json({ message: '获取用户信息失败' });
  }
});

// 上传头像
router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请上传头像文件' });
    }
    
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 保存头像路径
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();
    
    res.json({ avatar: avatarUrl });
  } catch (error) {
    console.error('上传头像失败:', error);
    res.status(500).json({ message: '上传头像失败' });
  }
});

// 在/update-username路由之前添加authenticateToken中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: '未授权访问' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'token无效或已过期' });
    req.user = decoded;
    next();
  });
};

router.patch('/update-username', authenticateToken, async (req, res) => {
  try {
    const { newUsername } = req.body;
    if (!newUsername || newUsername.trim().length < 3) {
      return res.status(400).json({ message: '用户名长度不能少于3个字符' });
    }

    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已被占用' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    user.username = newUsername;
    await user.save();

    res.json({ success: true, username: newUsername });
  } catch (error) {
    console.error('更新用户名错误:', error);
    res.status(500).json({ message: '服务器错误，更新用户名失败' });
  }
});

module.exports = router;