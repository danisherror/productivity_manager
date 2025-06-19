const User = require('../models/user');
const jwt = require('jsonwebtoken');
const BigPromise=require('../middlewares/bigPromise')
const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

exports.signup = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const existingUser = await User.findOne({ email: email});
    if (existingUser) return res.status(400).json({ message: 'Email already registered.' });

    const existingusername = await User.findOne({ username :username});
    if (existingusername) return res.status(400).json({ message: 'username already registered.' });

    const user = await User.create({ 
        username:username, 
        name:name, 
        email:email, 
        password: password
    });
    const token = user.getJwtToken();

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // use HTTPS in prod
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.signin = async (req, res) => {
  try {
    const {  identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide username/email and password.' });
    }

    // Try to find user by email first, then by username
    let user = await User.findOne({ email: identifier }).select('+password');
    if (!user) {
      user = await User.findOne({ username: identifier }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid username/email' });
      }
    }

    // Check password
    const isMatch = await user.isValidatedPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate token and set cookie
    const token = user.getJwtToken();
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // secure in production only
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
};

exports.userProfile=BigPromise(async(req,res)=>{

    const id=req.user._id
    const user=await User.findById(id);
    if(!user)
    {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    res.status(200).json({
        user
    })
})