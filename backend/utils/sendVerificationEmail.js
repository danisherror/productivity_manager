const crypto = require('crypto');
const sendEmail = require('./sendEmail');
const User = require('../models/user');

async function sendVerificationEmail(user) {
  // Generate token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hash and set to user
  user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  user.emailVerificationExpire = Date.now() + 60 * 60 * 1000; // 1 hour expiry
  await user.save({ validateBeforeSave: false });

  // Prepare verification link
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  // Email content (plain text or HTML)
  const message = `Please verify your email by clicking the following link:\n\n${verificationUrl}\n\nIf you did not request this, please ignore this email.`;

  // Send mail
  await sendEmail({
    to: user.email,
    subject: 'Email Verification - Productivity App',
    text: message,
  });
}

module.exports = sendVerificationEmail;
