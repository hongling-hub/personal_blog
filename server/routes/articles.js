const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// 获取所有文章
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 创建新文章
router.post('/', async (req, res) => {
  const article = new Article({
    title: req.body.title,
    content: req.body.content,
    // 其他字段...
  });

  try {
    const newArticle = await article.save();
    res.status(201).json(newArticle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;