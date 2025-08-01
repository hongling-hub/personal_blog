// ...existing code...
// ...existing code...
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Comment = require('../models/Comment');
const { authenticate } = require('../middleware/auth');

// 获取文章评论（需要登录，返回 isLiked 正确）
router.get('/article/:articleId', authenticate, async (req, res) => {
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
      replyIsLiked = replyLikesArr.some(like => like.toString() === req.user._id.toString());
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

// 点赞/取消点赞（切换）回复
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
    const userId = req.user._id;
    const likeIndex = reply.likes.findIndex(like => like.toString() === userId.toString());
    let isLiked;
    if (likeIndex === -1) {
      // 点赞
      reply.likes.push(userId);
      reply.likeCount = (reply.likeCount || 0) + 1;
      isLiked = true;
    } else {
      // 取消点赞
      reply.likes.splice(likeIndex, 1);
      reply.likeCount = Math.max((reply.likeCount || 1) - 1, 0);
      isLiked = false;
    }
    await comment.save();
    res.json({ likeCount: reply.likeCount, isLiked });
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

    if (!updatedComment) {
      return res.status(404).json({ message: '评论不存在' });
    }

    // 格式化回复数据，添加id字段
const formattedComment = updatedComment.toJSON();
formattedComment.id = formattedComment._id ? formattedComment._id.toString() : null;
formattedComment.replies = Array.isArray(formattedComment.replies) ? formattedComment.replies.map(reply => ({
  ...reply,
  id: reply._id ? reply._id.toString() : null
})) : [];
delete formattedComment._id;

res.status(201).json(formattedComment);
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
    let isLiked = false;
    if (!comment.likes.some(like => like.equals(userId))) {
      comment.likes.push(userId);
      comment.likeCount++;
      isLiked = true;
    } else {
      comment.likes.pull(userId);
      comment.likeCount--;
      isLiked = false;
    }
    await comment.save();

    // 格式化返回评论，带 isLiked 字段
    const commentObj = comment.toJSON();
    const likesArr = Array.isArray(commentObj.likes) ? commentObj.likes : [];
    // 重新判断 isLiked，防止并发问题
    isLiked = likesArr.some(like => like && like.toString() === userId.toString());
    const processedReplies = (commentObj.replies || []).map(reply => {
      const replyLikesArr = Array.isArray(reply.likes) ? reply.likes : [];
      let replyIsLiked = false;
      if (userId && replyLikesArr.length > 0) {
        replyIsLiked = replyLikesArr.some(like => like && like.toString() === userId.toString());
      }
      const processedReply = {
        ...reply,
        id: reply._id ? reply._id.toString() : undefined,
        likes: replyLikesArr.length,
        isLiked: replyIsLiked
      };
      delete processedReply._id;
      return processedReply;
    });
    const formattedComment = {
      ...commentObj,
      id: comment._id.toString(),
      likes: likesArr.length,
      isLiked,
      replies: processedReplies
    };
    delete formattedComment._id;
    res.json(formattedComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});






// 删除某条回复（放在所有路由定义之后）
router.delete('/:commentId/replies/:replyId', authenticate, async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: '评论不存在' });
    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: '回复不存在' });
    // 只允许回复作者本人删除
    if (reply.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '无权限删除该回复' });
    }
    comment.replies.pull(replyId);
    await comment.save();
    res.json({ message: '回复已删除' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 删除评论（放在所有路由定义之后）
router.delete('/:commentId', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: '评论不存在' });
    // 只允许作者本人或管理员删除
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '无权限删除该评论' });
    }
    await comment.deleteOne();
    res.json({ message: '评论已删除' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;