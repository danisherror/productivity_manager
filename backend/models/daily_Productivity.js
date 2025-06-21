const mongoose = require('mongoose');
const DailyProductivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    unique: true, // Ensure one entry per user per day
  },
  description: {
    type: String,
    default: '',
  },
  productivityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
  }
}, {
  timestamps: true // Automatically adds `createdAt` and `updatedAt`
});

module.exports = mongoose.model('DailyProductivity', DailyProductivitySchema);

