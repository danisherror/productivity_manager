const UserExpenses = require('../models/UserExpenses');


exports.create = async (req, res) => {
  try {
    const {
      expensesName,
      description,
      category,
      price,
      date
    } = req.body;
    const userId = req.user._id
    
    const newExpenses = new UserExpenses({
      user: userId,
      expensesName,
      description,
      category,
      price,
      date
    });

    const savedExpenses = await newExpenses.save();

    return res.status(201).json(savedExpenses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};


exports.getAll = async (req, res) => {
  try {
    const expenses = await UserExpenses.find({ user: req.user._id }).sort({ date: -1 }); // or createdAt
    res.status(200).json(expenses);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.getById = async (req, res) => {
  try {
    const expenses = await UserExpenses.findOne({ _id: req.params.id, user: req.user._id });
    if (!expenses) return res.status(404).json({ error: 'expenses not found' });

    res.status(200).json(expenses);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserExpensesHelper = async (req, res) => {
  try {
    const allExpenses = await UserExpenses.find({ user: req.user._id }).sort({ date: -1 });
    const expensesNameSet = new Set();
    const categorySet = new Set();
    for (let i = 0; i < allExpenses.length; i++) {
      if (allExpenses[i].expensesName) expensesNameSet.add(allExpenses[i].expensesName);
      if (allExpenses[i].category) categorySet.add(allExpenses[i].category);
    }

    const expensesNames = Array.from(expensesNameSet);
    const categories = Array.from(categorySet);

    res.status(200).json({ expensesNames, categories });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const {
      expensesName,
      description,
      category,
      price,
      date
    } = req.body;

    const expense = await UserExpenses.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ error: 'expense not found' });

    // Update fields
    if (expensesName !== undefined) expense.expensesName = expensesName;
    if (description !== undefined) expense.description = description;
    if (category !== undefined) expense.category = category;
    if (price !== undefined) expense.price = price;
    if (date !== undefined) expense.date = new Date(date);

    const updated = await expense.save();
    res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.delete = async (req, res) => {
  try {
    const expense = await UserExpenses.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ error: 'expense not found' });

    res.status(200).json({ message: 'expense deleted successfully' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
