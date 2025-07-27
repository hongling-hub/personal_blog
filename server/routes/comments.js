const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Comment = require('../models/Comment');
const { authenticate } = require('../middleware/auth');

// 获取文章评论
router.get('/article/:articleId', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.articleId)) {
    return res.status(400).json({ message: '无效的文章ID格式' });
  }
  try {
    const comments = await Comment.find({ article: req.params.articleId })
      .populate('author', 'username avatar')
      .populate({ path: 'replies.author', select: 'username avatar' });
    const formattedComments = comments.map(comment => {
      const commentObj = comment.toJSON();
      // likes 判空，防止 undefined
      const likesArr = Array.isArray(comment.likes) ? comment.likes : [];
      let isLiked = false;
      if (req.user && req.user._id && likesArr.length > 0) {
        isLiked = likesArr.some(like => like && like.equals && like.equals(req.user._id));
      }
      return {
        ...commentObj,
        id: comment._id.toString(),
        likes: likesArr.length,
        isLiked
      };
    });
    res.json(formattedComments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 添加评论
router.post('/', async (req, res) => {
  const comment = new Comment({
      content: req.body.content,
      article: req.body.articleId,
      author: req.body.author
    });

  try {
    const newComment = await comment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 评论点赞
router.post('/:commentId/like', authenticate, async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.commentId)
      .populate('author', 'username avatar')
      .populate({ path: 'replies.author', select: 'username avatar' });
    if (!comment) return res.status(404).json({ message: '评论不存在' });

    // 确保likes数组存在
    comment.likes = comment.likes || [];

    const userId = req.user._id;
    if (!comment.likes.some(like => like.equals(userId))) {
      comment.likes.push(userId);
      await comment.save();
      // 重新查一次，保证 populate 后返回最新 likes
      comment = await Comment.findById(req.params.commentId)
        .populate('author', 'username avatar')
        .populate({ path: 'replies.author', select: 'username avatar' });
      // 返回与获取评论接口一致的格式
      const commentObj = comment.toJSON();
      const likesArr = Array.isArray(comment.likes) ? comment.likes : [];
      let isLiked = false;
      if (req.user && req.user._id && likesArr.length > 0) {
        isLiked = likesArr.some(like => like && like.equals && like.equals(req.user._id));
      }
      res.json({
        ...commentObj,
        id: comment._id.toString(),
        likes: likesArr.length,
        isLiked
      });
    } else {
      res.status(400).json({ message: '您已点赞过此评论' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;