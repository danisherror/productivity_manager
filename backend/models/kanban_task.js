const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: "KanbanBoard" },
  columnTitle: String, // e.g., "To Do", "In Progress"
  title: { type: String, required: true },
  description: String,
  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
  tags: [String],
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  dueDate: Date,
  attachments: [{
    name: String,
    url: String,
    uploadedAt: Date,
  }],
  subtasks: [{
    title: String,
    isCompleted: { type: Boolean, default: false },
  }],
  isCompleted: { type: Boolean, default: false },
  order: Number,
}, { timestamps: true });

module.exports = mongoose.model("KanbanTask", taskSchema);
