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
  avatar: {
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/2650/2650869.png'
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
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  collectedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }]
}, { timestamps: true });

// 密码加密
UserSchema.pre('save', async function(next) {
  console.log('原始密码:', this.password);
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  console.log('加密后:', this.password);
  next();
});

// 密码验证
UserSchema.methods.validPassword = function(password) {
    if (!password || !this.password) return false;
    return bcrypt.compareSync(password, this.password);
};

// 生成JWT
UserSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { userId: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

UserSchema.methods.setPassword = async function(password) {
  this.password = await bcrypt.hash(password, 10);
  console.log('Password set to:', this.password); // 调试日志
  return this; // 返回修改后的用户对象
};

module.exports = mongoose.model('User', UserSchema);