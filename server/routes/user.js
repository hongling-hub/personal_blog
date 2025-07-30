const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// 关注作者
router.post('/follow/:id', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const authorId = req.params.id;

    // 检查是否已经关注
    if (user.following && user.following.includes(authorId)) {
      return res.status(400).json({ success: false, message: '已经关注该作者' });
    }

    // 更新关注者和被关注者信息
    await User.findByIdAndUpdate(user._id, {
      $push: { following: authorId }
    });

    await User.findByIdAndUpdate(authorId, {
      $push: { followers: user._id }
    });

    res.json({ success: true, message: '关注成功' });
  } catch (error) {
    console.error('关注失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 取消关注作者
router.post('/unfollow/:id', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const authorId = req.params.id;

    // 检查是否已经关注
    if (!user.following || !user.following.includes(authorId)) {
      return res.status(400).json({ success: false, message: '尚未关注该作者' });
    }

    // 更新关注者和被关注者信息
    await User.findByIdAndUpdate(user._id, {
      $pull: { following: authorId }
    });

    await User.findByIdAndUpdate(authorId, {
      $pull: { followers: user._id }
    });

    res.json({ success: true, message: '取消关注成功' });
  } catch (error) {
    console.error('取消关注失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 检查是否关注作者
router.get('/check-following/:id', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const authorId = req.params.id;

    const isFollowing = user.following && user.following.includes(authorId);

    res.json({ isFollowing });
  } catch (error) {
    console.error('检查关注状态失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;