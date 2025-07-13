const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// 获取所有文章(管理员)
router.get('/articles', async (req, res) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 删除文章
router.delete('/articles/:id', async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: '文章已删除' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;