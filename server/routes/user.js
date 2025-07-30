const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Article = require('../models/Article');
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

// 获取作者统计信息
router.get('/stats/:id', async (req, res) => {
  try {
    const authorId = req.params.id;

    // 获取文章数（只统计公开且非草稿的文章）
    const articleCount = await Article.countDocuments({
      author: authorId,
      isPublic: true,
      isDraft: false
    });

    // 获取阅读总数
    const viewsResult = await Article.aggregate([
      {
        $match: {
          author: new mongoose.Types.ObjectId(authorId),
          isPublic: true,
          isDraft: false
        }
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' }
        }
      }
    ]);
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    // 获取粉丝数
    const user = await User.findById(authorId);
    const followerCount = user ? user.followers.length : 0;

    res.json({
      success: true,
      data: {
        articleCount,
        totalViews,
        followerCount
      }
    });
  } catch (error) {
    console.error('获取作者统计信息失败:', error.message);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
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