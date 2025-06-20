const activitySchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "KanbanTask" },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: "KanbanBoard" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  taskTitleSnapshot: String,
  metadata: Object,
}, { timestamps: true });

activitySchema.index({ user: 1, boardId: 1 });

module.exports = mongoose.model("KanbanActivity", activitySchema);