const KanbanBoard = require('../models/kanban_board');
const KanbanTask = require('../models/kanban_task');


// Get all boards of a user
exports.getAll = async (req, res) => {
  const boards = await KanbanBoard.find({ user: req.user._id });
  res.json(boards);
};

// Create a new board
exports.create = async (req, res) => {
  const { title, columns } = req.body;
  try {
    const board = await KanbanBoard.create({ title, columns, user: req.user._id });
    res.status(201).json(board);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get a specific board
exports.getById = async (req, res) =>  {
  const board = await KanbanBoard.findOne({ _id: req.params.boardId, user: req.user._id });
  if (!board) return res.status(404).json({ error: 'Board not found' });
  res.json(board);
};

// Update a board
exports.update = async (req, res) =>{
  try {
    const updated = await KanbanBoard.findOneAndUpdate(
      { _id: req.params.boardId, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Board not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a board and its tasks
exports.delete = async (req, res) => {
  const boardId = req.params.boardId;
  const deleted = await KanbanBoard.findOneAndDelete({ _id: boardId, user: req.user._id });
  if (!deleted) return res.status(404).json({ error: 'Board not found' });

  await KanbanTask.deleteMany({ boardId });

  res.json({ message: 'Board and associated data deleted' });
};
