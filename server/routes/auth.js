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
  
  // 验证验证码
  if (captcha !== req.session.captcha) {
    return res.status(400).json({ message: '验证码错误' });
  }
  
  // 验证用户
  const user = await User.findOne({ username });
  if (!user || !user.validPassword(password)) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }
  
  // 生成JWT
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  
  res.json({ token });
});

module.exports = router;