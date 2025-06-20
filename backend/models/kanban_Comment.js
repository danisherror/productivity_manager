const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "KanbanTask" },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true, trim: true },
}, { timestamps: true });

module.exports = mongoose.model("KanbanComment", commentSchema);