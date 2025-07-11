const User = require('../models/user');
const UserRecord = require('../models/UserRecord');
const sendEmail = require('../utils/sendEmail');
const sendVerificationEmail = require('../utils/sendVerificationEmail');
const jwt = require('jsonwebtoken');
const BigPromise = require('../middlewares/bigPromise')
const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const crypto = require('crypto');
function isStrongPassword(password) {
  const minLength = password.length >= 8;
  const maxLength = password.length <= 20;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_\+\-=\[\]{}|;:,.<>?]/.test(password);
  return minLength && maxLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
}
exports.signup = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password is not strong enough. It must be 8-20 characters long and include uppercase, lowercase, number, and special character.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered.' });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: 'Username already registered.' });

    const user = await User.create({ username, name, email, password });

    // Generate token for email verification
    try {
      const verificationToken = jwt.sign({ id: user._id }, process.env.EMAIL_SECRET, { expiresIn: '1d' });
      const verificationURL = `${process.env.front_end_url}/verify-email?token=${verificationToken}`;

      await sendEmail({ to: user.email, subject: 'Verify Your Email', text: `Hi ${user.name}, please verify your email by clicking this link: ${verificationURL}` });

      res.status(201).json({ success: true, message: 'Signup successful. Please verify your email.' });

    } catch (err) {
      await User.findByIdAndDelete(user._id); // rollback
      return res.status(500).json({ message: 'Signup failed. Could not send verification email.' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.signin = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide username/email and password.' });
    }

    // Find user by email or username
    let user = await User.findOne({ email: identifier }).select('+password +emailVerified +emailVerificationToken +emailVerificationExpire');
    if (!user) {
      user = await User.findOne({ username: identifier }).select('+password +emailVerified +emailVerificationToken +emailVerificationExpire');
      if (!user) {
        return res.status(401).json({ message: 'Invalid username/email' });
      }
    }

    // Check password
    const isMatch = await user.isValidatedPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check email verification
    if (!user.emailVerified) {
      // Check if token exists and not expired
      const tokenExpired = !user.emailVerificationExpire || user.emailVerificationExpire < Date.now();

      if (tokenExpired) {
        // Send new verification email
        await sendVerificationEmail(user);
        return res.status(403).json({ message: 'Email is not verified. Verification email resent. Please check your email.' });
      } else {
        return res.status(405).json({ message: 'Email is not verified. Please check your email for verification link.' });
      }
    }

    // Generate token and set cookie
    const token = user.getJwtToken();
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0), // set cookie expiry to past date to delete
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.userProfile = BigPromise(async (req, res) => {

  const id = req.user._id
  const user = await User.findById(id);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }
  res.status(200).json({
    user
  })
})

exports.getUserRecord = async (req, res) => {
  try {
    const userId = req.user._id;

    const userRecord = await UserRecord.findOne({ user: userId });

    if (!userRecord || !userRecord.date || userRecord.date.length === 0) {
      return res.status(404).json({ message: "No login records found" });
    }

    // Convert each date to YYYY-MM-DD format
    const formattedDates = userRecord.date.map(d =>
      new Date(d).toISOString().slice(0, 10)
    );

    res.status(200).json({
      user: userId,
      dates: formattedDates,
    });
  } catch (error) {
    console.error('Error fetching user record:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Missing token' });

    const decoded = jwt.verify(token, process.env.EMAIL_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.emailVerified) return res.status(400).json({ message: 'Email already verified' });

    user.emailVerified = true;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};


exports.updatePassword = BigPromise(async (req, res) => {
  const userId = req.user._id; // Assuming you get user from token middleware
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Verify current password
  const isMatch = await user.isValidatedPassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  // Update password (pre-save hook will hash it)
  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

exports.verifyPassword = async (req, res) => {
  try {
    const { currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ message: 'Current password is required' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.isValidatedPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    // Password verified successfully
    res.status(200).json({ message: 'Password verified' });
  } catch (error) {
    console.error('verifyPassword error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: 'User with this email does not exist' });

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.front_end_url}/reset-password/${resetToken}`;

  const message = `You requested a password reset. Click here: ${resetURL}\n\nIf you did not request this, ignore this email.`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: message,
    });

    res.status(200).json({ message: 'Reset link sent to your email' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    console.error(err);
    res.status(500).json({ message: 'Email could not be sent' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    // console.log(req.body) 
    if (!password || password.trim() === '') {
      return res.status(400).json({ message: 'New password is required.' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'New password is required.' });
    }

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Reset token is invalid or expired.' });
    }

    user.password = password.trim();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};