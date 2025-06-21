const DailyProductivity = require('../models/daily_Productivity');

// Create a new productivity entry
exports.create = async (req, res) => {
  try {
    const { date, description, productivityScore } = req.body;

    // Check if already exists for the day and user
    const existing = await DailyProductivity.findOne({ user: req.user._id, date: new Date(date) });
    if (existing) {
      return res.status(400).json({ message: 'Entry for this date already exists.' });
    }

    const entry = await DailyProductivity.create({
      user: req.user._id,
      date: new Date(date),
      description,
      productivityScore,
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all productivity entries for the logged-in user
exports.getAll = async (req, res) => {
  try {
    const entries = await DailyProductivity.find({ user: req.user._id }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get a specific productivity entry by its ID
exports.getById = async (req, res) => {
  try {
    const entry = await DailyProductivity.findOne({ _id: req.params.id, user: req.user._id });

    if (!entry) return res.status(404).json({ message: 'Entry not found.' });

    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update a productivity entry
exports.update = async (req, res) => {
  try {
    const { description, productivityScore, date } = req.body;

    const updated = await DailyProductivity.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        ...(description !== undefined && { description }),
        ...(productivityScore !== undefined && { productivityScore }),
        ...(date && { date: new Date(date) }),
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'Entry not found.' });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a productivity entry
exports.delete = async (req, res) => {
  try {
    const deleted = await DailyProductivity.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!deleted) return res.status(404).json({ message: 'Entry not found.' });

    res.json({ message: 'Deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.getSummary = async (req, res) =>  {
  try {
    const userId = req.user._id; // assuming you're using auth middleware

    const records = await DailyProductivity.find({ user: userId });

    const totalScore = records.reduce((sum, record) => sum + record.productivityScore, 0);
    const numberOfDays = records.length;
    const percentage = numberOfDays > 0 ? (totalScore / (numberOfDays * 10)) * 100 : 0;

    res.json({
      totalScore,
      numberOfDays,
      percentage: Number(percentage.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};
