const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { authenticate } = require('../middleware/auth');

// 获取已发布文章
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const articles = await Article.find({
      isDraft: false,
      isPublic: true,
      publishTime: { $lte: now }
    }).populate('author', 'username avatar')
    .sort({ publishTime: -1 });

    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取文章详情
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: '文章未找到' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 创建新文章
router.post('/', authenticate, async (req, res) => {
  // 移除前端可能传递的无效likes字段
  delete req.body.likes;
  const article = new Article({
    title: req.body.title,
    content: req.body.content,
    markdown: req.body.markdown,
    author: req.user._id,
    isDraft: req.body.isDraft !== undefined ? req.body.isDraft : true,
    isPublic: req.body.isPublic !== undefined ? req.body.isPublic : false,
    publishTime: req.body.publishTime,
    coverImage: req.body.coverImage,
    desc: req.body.desc,
    tags: req.body.tags,
    authorAvatar: req.body.authorAvatar,
    views: 0
  });

  try {
    const newArticle = await article.save();
    res.status(201).json(newArticle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 更新文章
router.patch('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: '文章未找到' });

    if (req.body.title) article.title = req.body.title;
    if (req.body.content) article.content = req.body.content;
    if (req.body.markdown) article.markdown = req.body.markdown;
    if (req.body.isDraft !== undefined) article.isDraft = req.body.isDraft;
    if (req.body.isPublic !== undefined) article.isPublic = req.body.isPublic;
    if (req.body.publishTime) article.publishTime = req.body.publishTime;
    if (req.body.coverImage) article.coverImage = req.body.coverImage;
    if (req.body.desc) article.desc = req.body.desc;
    if (req.body.tags) article.tags = req.body.tags;

    const updatedArticle = await article.save();
    res.json(updatedArticle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;