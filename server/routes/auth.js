const express = require('express');
const router = express.Router();
const User = require('../models/User');
const svgCaptcha = require('svg-captcha');
const jwt = require('jsonwebtoken');

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
  if (captcha !== req.session.captcha) {
    console.log('验证码不匹配:', { 输入: captcha, 预期: req.session.captcha });
    return res.status(400).json({ message: '验证码错误' });
  }
  
  // 验证用户
  console.log('查询用户:', username);
  const user = await User.findOne({ username });
  if (!user) {
    console.log('用户不存在:', username);
    return res.status(401).json({ message: '用户名或密码错误' });
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
  process.env.JWT_SECRET,
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
      return res.status(400).json({ message: '用户名已存在' });
    }
    
    console.log('创建新用户:', username);
    const newUser = new User({ username });
    
    console.log('User model methods:', Object.keys(newUser.__proto__));
    console.log('设置密码...');
    await newUser.setPassword(password);
    await newUser.save();
    
    res.status(201).json({ message: '注册成功' });
  } catch (err) {
    console.error('注册错误:', err.stack);
    res.status(500).json({ 
      message: '注册失败', 
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
});

module.exports = router;