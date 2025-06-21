const User = require('../models/user');
const UserRecord = require('../models/UserRecord');
const sendEmail = require('../utils/sendEmail');
const sendVerificationEmail = require('../utils/sendVerificationEmail');
const jwt = require('jsonwebtoken');
const BigPromise = require('../middlewares/bigPromise')
const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

exports.signup = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered.' });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: 'Username already registered.' });

    const user = await User.create({ username, name, email, password });

    // Generate token for email verification
    const verificationToken = jwt.sign({ id: user._id }, process.env.EMAIL_SECRET, { expiresIn: '1d' });

    const verificationURL = `${process.env.front_end_url}/verify-email?token=${verificationToken}`;
    try{
    // Send email
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email',
      text: `Hi ${user.name}, please verify your email by clicking this link: ${verificationURL}`,
    });

    res.status(201).json({
      success: true,
      message: 'Signup successful. Please verify your email.',
    });
  }
  catch (error) {
    console.error('Signup 11error:', error);
    res.status(500).json({ message: 'Server error' });
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
