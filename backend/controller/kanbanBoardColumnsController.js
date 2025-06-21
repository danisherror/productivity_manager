const KanbanBoard = require('../models/kanban_board');
const KanbanTask = require('../models/kanban_task');

// Add a new column to board
exports.create = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, wipLimit = 0 } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Column title is required' });
    }

    const board = await KanbanBoard.findById(boardId);
    if (!board) return res.status(404).json({ error: 'Board not found' });

    // Check duplicate column title
    if (board.columns.some(col => col.title === title.trim())) {
      return res.status(400).json({ error: 'Column with this title already exists' });
    }

    // Determine order - push to end of columns list
    const newOrder = board.columns.length > 0 ? Math.max(...board.columns.map(c => c.order ?? 0)) + 1 : 0;

    board.columns.push({
      title: title.trim(),
      wipLimit,
      order: newOrder,
    });

    await board.save();

    res.status(201).json(board.columns);
  } catch (err) {
    console.error('Error adding column:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a column by ID (column._id) and delete all tasks in that column
exports.delete = async (req, res) => {
  try {
    const { boardId, columnId } = req.params;

    const board = await KanbanBoard.findById(boardId);
    if (!board) return res.status(404).json({ error: 'Board not found' });

    // Find the column by _id
    const column = board.columns.find(col => col._id.toString() === columnId);
    if (!column) return res.status(404).json({ error: 'Column not found' });

    const columnTitle = column.title;

    // Remove the column using filter
    board.columns = board.columns.filter(col => col._id.toString() !== columnId);

    await board.save();

    // Delete all tasks associated with the deleted column
    await KanbanTask.deleteMany({ boardId, columnTitle });

    res.status(200).json({ message: 'Column and related tasks deleted successfully' });
  } catch (err) {
    console.error('Error deleting column:', err);
    res.status(500).json({ error: 'Server error' });
  }
};



// Update column title or other fields
exports.update = async (req, res) => {
  try {
    const { boardId, columnId } = req.params;
    const { title, wipLimit } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Column title is required' });
    }

    const board = await KanbanBoard.findById(boardId);
    if (!board) return res.status(404).json({ error: 'Board not found' });

    const column = board.columns.id(columnId);
    if (!column) return res.status(404).json({ error: 'Column not found' });

    // Check for duplicate column title (excluding the current one)
    const isDuplicate = board.columns.some(
      (col) => col.title === title.trim() && col._id.toString() !== columnId
    );
    if (isDuplicate) {
      return res.status(400).json({ error: 'Column with this title already exists' });
    }

    const oldTitle = column.title;

    // Update column fields
    column.title = title.trim();
    if (wipLimit !== undefined) {
      column.wipLimit = wipLimit;
    }

    await board.save();

    // Update tasks with the new column title
    await KanbanTask.updateMany(
      { boardId, columnTitle: oldTitle },
      { $set: { columnTitle: title.trim() } }
    );

    res.status(200).json({ message: 'Column updated successfully', column });
  } catch (err) {
    console.error('Error updating column:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
