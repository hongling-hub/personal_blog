const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const { authenticate } = require('../middleware/auth');

// 搜索文章
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: '搜索参数不能为空' });
    }

    const now = new Date();
    const articles = await Article.find({
      isDraft: false,
      isPublic: true,
      publishTime: { $lte: now },
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [query] } },
        { 'author.username': { $regex: query, $options: 'i' } }
      ]
    })
    .populate('author', 'username avatar isVerified bio')
    .sort({ publishTime: -1 });

    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取已发布文章（支持分类、标签筛选和分页）
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const query = {
      isDraft: false,
      isPublic: true,
      publishTime: { $lte: now }
    };
    
    // 支持按分类筛选
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // 支持按标签筛选
    if (req.query.tag) {
      query.tags = req.query.tag;
    }

    // 分页参数
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 获取文章总数
    const total = await Article.countDocuments(query);
    
    // 获取文章列表
    const articles = await Article.find(query)
      .populate('author', 'username avatar isVerified bio')
      .sort({ publishTime: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      articles,
      pagination: {
        current: page,
        pageSize: limit,
        total,
        hasMore: skip + articles.length < total
      }
    });
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
      return res.json({
        articles: [],
        pagination: {
          current: 1,
          pageSize: 10,
          total: 0,
          hasMore: false
        }
      });
    }
    
    // 分页参数
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // 获取关注作者的公开文章
    const now = new Date();
    const query = {
      author: { $in: user.following },
      isDraft: false,
      isPublic: true,
      publishTime: { $lte: now }
    };
    
    // 获取文章总数
    const total = await Article.countDocuments(query);
    
    const articles = await Article.find(query)
      .populate('author', 'username avatar isVerified bio')
      .sort({ publishTime: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      articles,
      pagination: {
        current: page,
        pageSize: limit,
        total,
        hasMore: skip + articles.length < total
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取当前用户的所有文章（包括草稿）
router.get('/user', authenticate, async (req, res) => {
  try {
    const query = {
      author: req.user._id
    };
    
    // 支持按分类筛选
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // 支持按标签筛选
    if (req.query.tag) {
      query.tags = req.query.tag;
    }

    const articles = await Article.find(query)
      .populate('author', 'username avatar isVerified bio')
      .sort({ updatedAt: -1 });

    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取用户点赞的文章
router.get('/liked', authenticate, async (req, res) => {
  try {
    // 获取当前用户
    const user = req.user;
    
    // 检查用户是否有点赞的文章
    if (!user.likedArticles || user.likedArticles.length === 0) {
      return res.json([]);
    }
    
    // 获取用户点赞的文章
    const now = new Date();
    const articles = await Article.find({
      _id: { $in: user.likedArticles },
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

// 获取用户收藏的文章
router.get('/collected', authenticate, async (req, res) => {
  try {
    // 获取当前用户
    const user = req.user;
    
    // 检查用户是否有收藏的文章
    if (!user.collectedArticles || user.collectedArticles.length === 0) {
      return res.json([]);
    }
    
    // 获取用户收藏的文章
    const now = new Date();
    const articles = await Article.find({
      _id: { $in: user.collectedArticles },
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

    // 检查当前用户是否点赞/收藏了该文章
    const isLiked = req.user && req.user._id ? 
      article.likes.some(like => like && like.equals && like.equals(req.user._id)) : 
      false;
    const isCollected = req.user && req.user._id ? 
      article.collections.some(collect => collect && collect.equals && collect.equals(req.user._id)) : 
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
    tags: req.body.tags || [],
    category: req.body.category || '未分类',
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
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: '文章未找到' });
    
    // 检查权限
    if (article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '没有权限修改此文章' });
    }

    if (req.body.title) article.title = req.body.title;
    if (req.body.content) article.content = req.body.content;
    if (req.body.markdown) article.markdown = req.body.markdown;
    if (req.body.isDraft !== undefined) article.isDraft = req.body.isDraft;
    if (req.body.isPublic !== undefined) article.isPublic = req.body.isPublic;
    if (req.body.publishTime) article.publishTime = req.body.publishTime;
    if (req.body.coverImage) article.coverImage = req.body.coverImage;
    if (req.body.desc) article.desc = req.body.desc;
    if (req.body.tags !== undefined) article.tags = req.body.tags;
    if (req.body.category !== undefined) article.category = req.body.category;
    article.updatedAt = Date.now();

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
      
      // 添加到用户的点赞文章列表
      req.user.likedArticles = req.user.likedArticles || [];
      if (!req.user.likedArticles.includes(article._id)) {
        req.user.likedArticles.push(article._id);
      }
    } else {
      // 取消点赞
      article.likes.splice(likeIndex, 1);
      article.likeCount = Math.max((article.likeCount || 1) - 1, 0);
      isLiked = false;
      
      // 从用户的点赞文章列表中移除
      req.user.likedArticles = req.user.likedArticles || [];
      const userLikeIndex = req.user.likedArticles.findIndex(id => id.toString() === article._id.toString());
      if (userLikeIndex !== -1) {
        req.user.likedArticles.splice(userLikeIndex, 1);
      }
    }

    await article.save();
    await req.user.save(); // 保存用户信息
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
      
      // 添加到用户的收藏文章列表
      req.user.collectedArticles = req.user.collectedArticles || [];
      if (!req.user.collectedArticles.includes(article._id)) {
        req.user.collectedArticles.push(article._id);
      }
    } else {
      // 取消收藏
      article.collections.splice(collectIndex, 1);
      article.collectCount = Math.max((article.collectCount || 1) - 1, 0);
      isCollected = false;
      
      // 从用户的收藏文章列表中移除
      req.user.collectedArticles = req.user.collectedArticles || [];
      const userCollectIndex = req.user.collectedArticles.findIndex(id => id.toString() === article._id.toString());
      if (userCollectIndex !== -1) {
        req.user.collectedArticles.splice(userCollectIndex, 1);
      }
    }

    await article.save();
    await req.user.save(); // 保存用户信息
    res.json({
      message: isCollected ? '收藏成功' : '取消收藏成功',
      collectCount: article.collectCount,
      isCollected
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 删除自己的文章（作者功能）
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const articleId = req.params.id;
    const userId = req.user._id;
    
    // 首先检查文章是否存在且属于当前用户
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: '文章不存在' });
    }
    
    // 验证权限：只有文章作者可以删除自己的文章
    if (article.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: '没有权限删除此文章' });
    }
    
    // 级联删除相关评论
    const commentsDeleted = await Comment.deleteMany({ article: articleId });
    
    // 删除文章
    await Article.findByIdAndDelete(articleId);
    
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

// 获取热门文章
router.get('/hot', async (req, res) => {
  try {
    const now = new Date();
    const query = {
      isDraft: false,
      isPublic: true,
      publishTime: { $lte: now }
    };
    
    // 支持按分类筛选热门文章
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    const articles = await Article.find(query)
      .populate('author', 'username avatar isVerified bio')
      .sort({ views: -1 })
      .limit(10);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取其他用户的文章
router.get('/user/:userId', async (req, res) => {
  try {
    const now = new Date();
    const query = {
      author: req.params.userId,
      isDraft: false,
      isPublic: true,
      publishTime: { $lte: now }
    };
    
    // 支持按分类筛选
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // 支持按标签筛选
    if (req.query.tag) {
      query.tags = req.query.tag;
    }
    
    const articles = await Article.find(query)
      .populate('author', 'username avatar isVerified bio')
      .sort({ publishTime: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取所有文章分类
router.get('/categories', async (req, res) => {
  try {
    const categories = await Article.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取所有文章标签
router.get('/tags', async (req, res) => {
  try {
    const tags = await Article.distinct('tags');
    res.json(tags);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;