const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 密码加密
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 密码验证
UserSchema.methods.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// 生成JWT
UserSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { userId: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

module.exports = mongoose.model('User', UserSchema);