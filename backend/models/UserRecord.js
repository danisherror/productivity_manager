const mongoose = require('mongoose');

const UserRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: [Date],
    required: true,
    validate: {
      validator: function (dates) {
        const uniqueDates = new Set(dates.map(d => d.toISOString().slice(0, 10)));
        return uniqueDates.size === dates.length;
      },
      message: 'Dates array contains duplicate values',
    },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('UserRecord', UserRecordSchema);
