import React, { useState, useEffect } from 'react';

export default function CreateExpenses() {
  const emptyExpense = {
    expensesName: '',
    customExpensesName: '',
    description: '',
    category: '',
    customCategory: '',
    price: '',
    date: '', // New field added
  };

  const [expenses, setExpenses] = useState([emptyExpense]);
  const [expensesNameOptions, setExpensesNameOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHelperData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user_expense_helper`, {
          credentials: 'include',
        });
        const data = await response.json();
        setExpensesNameOptions(data.expensesNames || []);
        setCategoryOptions(data.categories || []);
      } catch (err) {
        console.error('Failed to fetch helper data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHelperData();
  }, []);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    setExpenses(prev =>
      prev.map((exp, i) =>
        i === index ? { ...exp, [name]: value } : exp
      )
    );
  };

  const addExpenseForm = () => {
    setExpenses([...expenses, emptyExpense]);
  };

  const removeExpenseForm = index => {
    if (expenses.length === 1) return;
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const preparedExpenses = expenses.map(exp => ({
      expensesName: exp.expensesName === '__custom__' ? exp.customExpensesName : exp.expensesName,
      category: exp.category === '__custom__' ? exp.customCategory : exp.category,
      description: exp.description,
      price: Number(exp.price),
      date: exp.date || new Date().toISOString().slice(0, 10), // Default to today if not provided
    }));

    const invalid = preparedExpenses.some(exp =>
      !exp.expensesName || !exp.category || isNaN(exp.price) || exp.price <= 0 || !exp.date
    );

    if (invalid) {
      setError('Each expense must include: Name, Category, valid Price, and Date.');
      return;
    }

    try {
      const responses = await Promise.all(
        preparedExpenses.map(exp =>
          fetch(`${process.env.REACT_APP_BACKEND_URL}/user_expense_create`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exp),
          })
        )
      );

      const failed = [];
      for (let i = 0; i < responses.length; i++) {
        if (!responses[i].ok) {
          const errData = await responses[i].json();
          failed.push(`Expense ${i + 1}: ${errData.error || 'Unknown error'}`);
        }
      }

      if (failed.length > 0) {
        setError(failed.join('\n'));
      } else {
        setMessage('All expenses created successfully!');
        setExpenses([emptyExpense]);
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Create Multiple Expenses</h2>
      {error && <p className="text-red-600 whitespace-pre-line mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          <span className="ml-3 text-blue-600 text-lg">Loading...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {expenses.map((exp, index) => (
            <div key={`expense-${index}`} className="p-4 border rounded shadow-sm space-y-4 relative">
              <button
                type="button"
                onClick={() => removeExpenseForm(index)}
                className="absolute top-2 right-2 text-red-500 hover:underline"
                disabled={expenses.length === 1}
              >
                Remove
              </button>

              {/* Expense Name */}
              <div>
                <label className="block font-medium">Expense Name*</label>
                <select
                  value={exp.expensesName}
                  onChange={e => handleChange(index, e)}
                  name="expensesName"
                  className="w-full border px-3 py-2 rounded mt-1"
                >
                  <option value="">-- Select name --</option>
                  {expensesNameOptions.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                  <option value="__custom__">Other</option>
                </select>
                {exp.expensesName === '__custom__' && (
                  <input
                    type="text"
                    placeholder="Enter custom expense name"
                    name="customExpensesName"
                    value={exp.customExpensesName}
                    onChange={e => handleChange(index, e)}
                    className="w-full border px-3 py-2 rounded mt-2"
                  />
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium">Description</label>
                <textarea
                  name="description"
                  value={exp.description}
                  onChange={e => handleChange(index, e)}
                  rows={2}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-medium">Category*</label>
                <select
                  value={exp.category}
                  onChange={e => handleChange(index, e)}
                  name="category"
                  className="w-full border px-3 py-2 rounded mt-1"
                >
                  <option value="">-- Select category --</option>
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__custom__">Other</option>
                </select>
                {exp.category === '__custom__' && (
                  <input
                    type="text"
                    placeholder="Enter custom category"
                    name="customCategory"
                    value={exp.customCategory}
                    onChange={e => handleChange(index, e)}
                    className="w-full border px-3 py-2 rounded mt-2"
                  />
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block font-medium">Price (in ₹/$)*</label>
                <input
                  type="number"
                  name="price"
                  value={exp.price}
                  onChange={e => handleChange(index, e)}
                  className="w-full border px-3 py-2 rounded"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block font-medium">Date*</label>
                <input
                  type="date"
                  name="date"
                  value={exp.date}
                  onChange={e => handleChange(index, e)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
            </div>
          ))}

          {/* Add & Submit Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={addExpenseForm}
              className="text-blue-600 hover:underline"
            >
              + Add another expense
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Submit All Expenses
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
