const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },

    password: {
      type: String,
      required: true,
      select: false, // don't return password by default
    },

    auth_provider: {
      type: String,
      enum: ['local', 'google', 'apple'],
      default: 'local',
    },

    avatar_url: {
      type: String,
      default: '',
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    bio: {
      type: String,
      default: '',
    },

    timezone: {
      type: String,
      default: 'UTC',
    },

    preferences: {
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      reminders_enabled: { type: Boolean, default: true },
      reminder_time: { type: String, default: '08:00' }, // HH:mm format
      language: { type: String, default: 'en' },
    },

    level: {
      type: Number,
      default: 1,
    },

    xp: {
      type: Number,
      default: 0,
    },

    total_points: {
      type: Number,
      default: 0,
    },

    completed_quests: {
      type: Number,
      default: 0,
    },

    current_streak: {
      type: Number,
      default: 0,
    },

    longest_streak: {
      type: Number,
      default: 0,
    },

    badges: {
      type: [String],
      default: [],
    },

    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    public_quests: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Encrypt password before saving (only if modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Validate password
userSchema.methods.isValidatedPassword = async function (userSendPassword) {
  return await bcrypt.compare(userSendPassword, this.password);
};

// Generate JWT token
userSchema.methods.getJwtToken = function () {
  return jwt.sign(
    { id: this._id, username: this.username },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY || '1d',
    }
  );
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

  return resetToken;
};

// Remove password from returned JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
