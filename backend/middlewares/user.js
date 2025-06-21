const User = require('../models/user');
const jwt = require('jsonwebtoken');
const UserRecord = require('../models/UserRecord');

exports.isLoggedIn = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(403).json({ message: "Token is missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    const today = new Date();

    // Find or create the UserRecord
    let userRecord = await UserRecord.findOne({ user: req.user._id });

    if (!userRecord) {
      // Create new document with today's date
      userRecord = new UserRecord({
        user: req.user._id,
        date: [today],
      });
    } else {
      // Check if today's date already exists in the array
      const alreadyExists = userRecord.date.some(d => d.toISOString().slice(0, 10) === today.toISOString().slice(0, 10));

      if (!alreadyExists) {
        userRecord.date.push(today);
      }
    }

    await userRecord.save();

    next();
  } catch (error) {
    console.error("Token error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
