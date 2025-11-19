const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Comment = require('../models/Comment');

// 获取所有文章(管理员)
router.get('/articles', async (req, res) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 删除文章（级联删除相关评论）
router.delete('/articles/:id', async (req, res) => {
  try {
    // 先删除相关的所有评论，确保数据一致性
    const commentsDeleted = await Comment.deleteMany({ article: req.params.id });
    
    // 然后删除文章本身
    const articleDeleted = await Article.findByIdAndDelete(req.params.id);
    
    if (!articleDeleted) {
      return res.status(404).json({ message: '文章不存在' });
    }
    
    res.json({
      message: '文章及相关评论已删除',
      details: {
        articleDeleted: true,
        commentsDeleted: commentsDeleted.deletedCount
      }
    });
  } catch (err) {
    console.error('删除文章失败:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;