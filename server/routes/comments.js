const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// 获取文章评论
router.get('/:articleId', async (req, res) => {
  try {
    const comments = await Comment.find({ article: req.params.articleId }).populate('author', 'username avatar').populate({ path: 'replies.author', select: 'username avatar' });
    res.json(comments);
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

module.exports = router;