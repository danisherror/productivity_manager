const UserSchedule = require('../models/UserSchedule');


exports.create = async (req, res) => {
  try {
    const {
      taskName,
      description,
      category,
      tags,
      startTime,
      endTime,
      isCompleted,
      productivityScore,
      mood,
      energyLevel
    } = req.body;
    const userId=req.user._id

    // Validate start and end time
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ error: 'endTime must be after startTime' });
    }

    // Auto-calculate duration in minutes
    const duration = Math.round((new Date(endTime) - new Date(startTime)) / 60000);

    const newTask = new UserSchedule({
      user: userId,
      taskName,
      description,
      category,
      tags,
      startTime,
      endTime,
      duration,
      isCompleted,
      productivityScore,
      mood,
      energyLevel
    });

    const savedTask = await newTask.save();

    return res.status(201).json(savedTask);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};


exports.getAll = async (req, res) => {
  try {
    const tasks = await UserSchedule.find({ user: req.user._id }).sort({ startTime: 1 });
    res.status(200).json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const task = await UserSchedule.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.status(200).json(task);
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const {
      taskName,
      description,
      category,
      tags,
      startTime,
      endTime,
      isCompleted,
      productivityScore,
      mood,
      energyLevel
    } = req.body;

    const task = await UserSchedule.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Update fields
    if (taskName !== undefined) task.taskName = taskName;
    if (description !== undefined) task.description = description;
    if (category !== undefined) task.category = category;
    if (tags !== undefined) task.tags = tags;
    if (startTime !== undefined) task.startTime = new Date(startTime);
    if (endTime !== undefined) task.endTime = new Date(endTime);
    if (isCompleted !== undefined) task.isCompleted = isCompleted;
    if (productivityScore !== undefined) task.productivityScore = productivityScore;
    if (mood !== undefined) task.mood = mood;
    if (energyLevel !== undefined) task.energyLevel = energyLevel;

    // Recalculate duration if time was updated
    if (startTime !== undefined || endTime !== undefined) {
      if (new Date(task.endTime) <= new Date(task.startTime)) {
        return res.status(400).json({ error: 'endTime must be after startTime' });
      }
      task.duration = Math.round((new Date(task.endTime) - new Date(task.startTime)) / 60000);
    }

    const updated = await task.save();
    res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.delete = async (req, res) => {
  try {
    const task = await UserSchedule.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
