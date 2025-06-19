const mongoose = require('mongoose');

const userScheduleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskName: {
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
  tags: {
    type: [String],
    default: []
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'endTime must be after startTime'
    }
  },
  duration: {
    type: Number, // store in minutes or seconds
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  productivityScore: {
    type: Number, // Optional score (e.g. 1-10) to rate how productive the task was
    min: 0,
    max: 10,
    default: null
  },
  mood: {
    type: String, // User mood during/after the task (optional)
    enum: ['Happy', 'Neutral', 'Sad', 'Tired', 'Motivated', 'Stressed'],
    default: 'Neutral'
  },
  energyLevel: {
    type: Number, // Optional 1-10 scale
    min: 1,
    max: 10,
    default: 5
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserSchedule', userScheduleSchema);
