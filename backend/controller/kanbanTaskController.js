const KanbanTask = require('../models/kanban_task');


// Get all tasks for a specific board
exports.getAll = async (req, res) =>  {
  try{
    const tasks = await KanbanTask.find({ boardId: req.params.boardId, user: req.user._id });
  res.status(200).json(tasks);
  }
  catch (err) {
    console.log(err)
    res.status(400).json({ error: err.message });
  }
};

// Create a task in a specific board
exports.create = async (req, res) => {
  try {
    const task = await KanbanTask.create({
      ...req.body,
      boardId: req.params.boardId,
      user: req.user._id
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get a specific task
exports.getById = async (req, res) => {
  const task = await KanbanTask.findOne({
    _id: req.params.taskId,
    boardId: req.params.boardId,
    user: req.user._id
  });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
};

// Update a specific task
exports.update = async (req, res) => {
  try {
    const task = await KanbanTask.findOneAndUpdate(
      {
        _id: req.params.taskId,
        boardId: req.params.boardId,
        user: req.user._id
      },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });


    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a specific task
exports.delete = async (req, res) =>  {
  const deleted = await KanbanTask.findOneAndDelete({
    _id: req.params.taskId,
    boardId: req.params.boardId,
    user: req.user._id
  });
  if (!deleted) return res.status(404).json({ error: 'Task not found' });


  res.json({ message: 'Task deleted' });
};
