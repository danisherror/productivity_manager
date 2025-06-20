const mongoose = require('mongoose');
const boardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
  columns: [{
    title: String,
    wipLimit: { type: Number, default: 0 }, // 0 = no limit
    order: Number,
  }],
  isTemplate: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("KanbanBoard", boardSchema);
