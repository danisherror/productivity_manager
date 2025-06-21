const mongoose = require('mongoose');
const boardSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    default: '',
  },
  columns: {
    type: [
      {
        title: { type: String, required: true },
        wipLimit: { type: Number, default: 0 },
        order: Number,
      }
    ],
    default: [],
    validate: [(val) => val.length > 0, '{PATH} must have at least one column']
  },
  isTemplate: { type: Boolean, default: false },
}, { timestamps: true });

boardSchema.index({ user: 1 });

module.exports = mongoose.model("KanbanBoard", boardSchema);