const User = require('../models/user');
const BigPromise = require('./bigPromise');
const jwt = require('jsonwebtoken');

// Middleware to check if user is signed in and inject user info into req.user
exports.isLoggedIn = BigPromise(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(403).json({ message: "Token is missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Inject user data from DB
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  return next();
});
