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
    }).populate('author', 'username avatar isVerified bio')
    .sort({ publishTime: -1 });

    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取关注作者的文章
router.get('/following', authenticate, async (req, res) => {
  try {
    // 获取当前用户
    const user = req.user;
    
    // 检查用户是否有关注的作者
    if (!user.following || user.following.length === 0) {
      return res.json([]);
    }
    
    // 获取关注作者的公开文章
    const now = new Date();
    const articles = await Article.find({
      author: { $in: user.following },
      isDraft: false,
      isPublic: true,
      publishTime: { $lte: now }
    }).populate('author', 'username avatar isVerified bio')
    .sort({ publishTime: -1 });
    
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取当前用户的所有文章（包括草稿）
router.get('/user', authenticate, async (req, res) => {
  try {
    const articles = await Article.find({
      author: req.user._id
    }).populate('author', 'username avatar isVerified bio')
    .sort({ updatedAt: -1 });

    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取文章详情
router.get('/:id', async (req, res) => {
  try {
    // 增加阅读量 - 添加防抖机制
    console.log('Updating views for article:', req.params.id);
    // 使用内存缓存来记录短时间内的访问
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '';
    const cacheKey = `article_views:${req.params.id}:${clientIp}`;
    
    // 初始化global.viewCache如果不存在
    if (!global.viewCache) global.viewCache = {};
    
    let article;
    // 检查是否在最近1分钟内已经增加过阅读量
    if (!global.viewCache[cacheKey]) {
      global.viewCache[cacheKey] = true;
      
      // 1分钟后清除缓存
      setTimeout(() => {
        delete global.viewCache[cacheKey];
      }, 60000);
      
      // 增加阅读量
      article = await Article.findByIdAndUpdate(
        req.params.id,
        { $inc: { views: 1 } },
        { new: true }
      ).populate('author', 'username avatar isVerified bio');
    } else {
      // 如果已经增加过，直接获取文章
      article = await Article.findById(req.params.id)
        .populate('author', 'username avatar isVerified bio');
    }
    if (!article) return res.status(404).json({ message: '文章未找到' });

    // 检查当前用户是否点赞/收藏了该文章（采用comments.js中更健壮的方式）
    const isLiked = req.user && req.user._id ? 
      article.likes.some(like => like && like.toString && like.toString() === req.user._id.toString()) : 
      false;
    const isCollected = req.user && req.user._id ? 
      article.collections.some(collect => collect && collect.toString && collect.toString() === req.user._id.toString()) : 
      false;

    // 将状态添加到响应中
    const articleData = article.toObject();
    articleData.isLiked = isLiked || false;
    articleData.isCollected = isCollected || false;

    // 处理评论及回复的点赞状态
    articleData.comments = articleData.comments.map(comment => {
      const commentLikes = Array.isArray(comment.likes) ? comment.likes : [];
      const commentIsLiked = req.user?._id ? commentLikes.some(like => like.toString() === req.user._id.toString()) : false;

      const processedReplies = (comment.replies || []).map(reply => {
        const replyLikes = Array.isArray(reply.likes) ? reply.likes : [];
        const replyIsLiked = req.user?._id ? replyLikes.some(like => like.toString() === req.user._id.toString()) : false;
        return { ...reply, isLiked: replyIsLiked };
      });

      return { ...comment, isLiked: commentIsLiked, replies: processedReplies };
    });

    res.json(articleData);
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

// 点赞/取消点赞文章（切换）
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: '文章未找到' });

    const userId = req.user._id;
    const likeIndex = article.likes.findIndex(like => like.toString() === userId.toString());
    let isLiked;

    if (likeIndex === -1) {
      // 点赞
      article.likes.push(userId);
      article.likeCount = (article.likeCount || 0) + 1;
      isLiked = true;
    } else {
      // 取消点赞
      article.likes.splice(likeIndex, 1);
      article.likeCount = Math.max((article.likeCount || 1) - 1, 0);
      isLiked = false;
    }

    await article.save();
    res.json({
      message: isLiked ? '点赞成功' : '取消点赞成功',
      likeCount: article.likeCount,
      isLiked
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 收藏/取消收藏文章（切换）
router.post('/:id/collect', authenticate, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: '文章未找到' });

    const userId = req.user._id;
    const collectIndex = article.collections.findIndex(collect => collect.toString() === userId.toString());
    let isCollected;

    if (collectIndex === -1) {
      // 收藏
      article.collections.push(userId);
      article.collectCount = (article.collectCount || 0) + 1;
      isCollected = true;
    } else {
      // 取消收藏
      article.collections.splice(collectIndex, 1);
      article.collectCount = Math.max((article.collectCount || 1) - 1, 0);
      isCollected = false;
    }

    await article.save();
    res.json({
      message: isCollected ? '收藏成功' : '取消收藏成功',
      collectCount: article.collectCount,
      isCollected
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;