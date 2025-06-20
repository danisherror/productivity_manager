const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "KanbanTask" },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: "KanbanBoard" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: String, // e.g., "created task", "moved card", "added comment"
  metadata: Object, // additional info (e.g., {from: "To Do", to: "In Progress"})
}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);
