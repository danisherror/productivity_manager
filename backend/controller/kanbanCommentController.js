const KanbanComment = require('../models/kanban_comment');

// Middleware to require authentication (placeholder)
const requireAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

// Get all comments for a specific task
exports.getAll = async (req, res) =>  {
  try {
    const comments = await KanbanComment.find({ taskId: req.params.taskId })
      .populate('author', 'name email'); // populate author info if needed
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new comment for a task
exports.create = async (req, res) =>{
  try {
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const comment = await KanbanComment.create({
      taskId: req.params.taskId,
      author: req.user._id,
      content: content.trim(),
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a comment (only author can update)
exports.update = async (req, res) => {
  try {
    const comment = await KanbanComment.findOne({
      _id: req.params.commentId,
      author: req.user._id,
    });
    if (!comment) return res.status(404).json({ error: 'Comment not found or unauthorized' });

    if (req.body.content && req.body.content.trim() !== '') {
      comment.content = req.body.content.trim();
    }

    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a comment (only author can delete)
exports.delete = async (req, res) => {
  try {
    const deleted = await KanbanComment.findOneAndDelete({
      _id: req.params.commentId,
      author: req.user._id,
    });
    if (!deleted) return res.status(404).json({ error: 'Comment not found or unauthorized' });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

