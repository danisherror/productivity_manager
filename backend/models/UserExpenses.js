const mongoose = require('mongoose');

const userExpensesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expensesName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    required: true // e.g., Work, Study, Exercise, Break, Sleep
  },
  price: {
    type: Number, // store in minutes or seconds
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserExpenses', userExpensesSchema);
