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
  // 处理评论的点赞状态
  const likesArr = Array.isArray(comment.likes) ? comment.likes : [];
  let isLiked = false;
  if (req.user && req.user._id && likesArr.length > 0) {
    isLiked = likesArr.some(like => like && like.equals && like.equals(req.user._id));
  }

  // 处理回复的点赞状态
  const processedReplies = (commentObj.replies || []).map(reply => {
    const replyLikesArr = Array.isArray(reply.likes) ? reply.likes : [];
    let replyIsLiked = false;
    if (req.user && req.user._id && replyLikesArr.length > 0) {
      replyIsLiked = replyLikesArr.some(like => like && like.equals && like.equals(req.user._id));
    }
    const processedReply = {
      ...reply,
      id: reply._id.toString(),
      likes: replyLikesArr.length,
      isLiked: replyIsLiked
    };
    delete processedReply._id;
    return processedReply;
  });

  return {
    ...commentObj,
    id: comment._id.toString(),
    likes: likesArr.length,
    isLiked,
    replies: processedReplies
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

// 点赞回复
router.post('/:commentId/replies/:replyId/like', authenticate, async (req, res) => {
  try {
    const { commentId, replyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(replyId)) {
      return res.status(400).json({ message: '无效的ID格式' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: '评论不存在' });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: '回复不存在' });

    // 检查用户是否已经点赞
    const userId = req.user._id;
    const likeIndex = reply.likes.indexOf(userId);

    if (likeIndex === -1) {
      // 点赞
      reply.likes.push(userId);
    } else {
      // 取消点赞
      reply.likes.splice(likeIndex, 1);
    }

    await comment.save();
    res.json({ likes: reply.likes.length, isLiked: likeIndex === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 添加评论回复
router.post('/:commentId/replies', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: '评论不存在' });

    const newReply = {
      content: req.body.content,
      author: req.user._id,
      createdAt: new Date()
    };

    comment.replies.push(newReply);
    await comment.save();
    
    // 返回更新后的评论（包含新回复）
    const updatedComment = await Comment.findById(req.params.commentId)
      .populate('author', 'username avatar')
      .populate({ path: 'replies.author', select: 'username avatar' });

    // 格式化回复数据，添加id字段
const formattedComment = updatedComment.toJSON();
formattedComment.id = formattedComment._id.toString();
formattedComment.replies = formattedComment.replies.map(reply => ({
  ...reply,
  id: reply._id.toString()
}));
delete formattedComment._id;

es.status(201).json(formattedComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 评论点赞
// 点赞


// 取消点赞
router.delete('/:commentId/like', authenticate, async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.commentId);
    comment.likes = comment.likes || [];
    const userId = req.user._id;
    const index = comment.likes.findIndex(like => like.equals(userId));
    if (index > -1) {
      comment.likes.splice(index, 1);
      comment.likeCount--;
    }
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
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
      comment.likeCount++;
    } else {
      comment.likes.pull(userId);
      comment.likeCount--;
    }
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 回复点赞
router.post('/replies/:replyId/like', authenticate, async (req, res) => {
  try {
    const replyId = req.params.replyId;
    const userId = req.user._id;

    const comment = await Comment.findOneAndUpdate(
      { 'replies._id': replyId },
      { $addToSet: { 'replies.$.likes': userId }, $inc: { 'replies.$.likeCount': 1 } },
      { new: true, runValidators: true }
    ).populate('author', 'username avatar')
     .populate({ path: 'replies.author', select: 'username avatar' });

    if (!comment) {
      return res.status(404).json({ message: '回复不存在' });
    }

    const updatedReply = comment.replies.id(replyId);
    res.json(updatedReply);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 回复取消点赞
router.post('/replies/:replyId/unlike', authenticate, async (req, res) => {
  try {
    const replyId = req.params.replyId;
    const userId = req.user._id;

    const comment = await Comment.findOneAndUpdate(
      { 'replies._id': replyId },
      { $pull: { 'replies.$.likes': userId }, $inc: { 'replies.$.likeCount': -1 } },
      { new: true, runValidators: true }
    ).populate('author', 'username avatar')
     .populate({ path: 'replies.author', select: 'username avatar' });

    if (!comment) {
      return res.status(404).json({ message: '回复不存在' });
    }

    const updatedReply = comment.replies.id(replyId);
    res.json(updatedReply);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;