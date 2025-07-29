const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  replies: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    likeCount: {
      type: Number,
      default: 0
    }
  }]
});

CommentSchema.methods.like = function(userId) {
  if (!this.likes.some(like => like.equals(userId))) {
    this.likes.push(userId);
    this.likeCount++;
  }
  return this.save();
};

CommentSchema.methods.unlike = function(userId) {
  const index = this.likes.findIndex(like => like.equals(userId));
  if (index > -1) {
    this.likes.splice(index, 1);
    this.likeCount--;
  }
  return this.save();
};

CommentSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Comment', CommentSchema);