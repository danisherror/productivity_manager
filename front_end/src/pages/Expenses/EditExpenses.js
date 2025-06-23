import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditExpense() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);
  const [expensesNameOptions, setExpensesNameOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loadingHelper, setLoadingHelper] = useState(true);
  const [loadingInfo, setLoadingInfo] = useState(true);

  // Fetch expense details by ID
  useEffect(() => {
    const fetchExpense = async () => {
      setLoadingInfo(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user_expense_getByID/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) setFormData(data);
        else setError(data.error || 'Could not fetch expense');
      } catch (err) {
        setError('Server error');
      } finally {
        setLoadingInfo(false);
      }
    };
    fetchExpense();
  }, [id]);

  // Fetch helper data (expense names & categories)
  useEffect(() => {
    const fetchHelperData = async () => {
      setLoadingHelper(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user_expense_helper`, {
          credentials: 'include',
        });
        const data = await res.json();
        setExpensesNameOptions(data.expensesNames || []);
        setCategoryOptions(data.categories || []);
      } catch (err) {
        console.error('Failed to fetch helper data');
      } finally {
        setLoadingHelper(false);
      }
    };
    fetchHelperData();
  }, []);

  // Handle input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit updated expense
  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    const {
      expensesName,
      description,
      category,
      price,
      date,
    } = formData || {};

    if (!expensesName || !category || !price || !date) {
      setError('Please fill all required fields: Expense Name, Category, Price, and Date.');
      return;
    }

    if (isNaN(Number(price)) || Number(price) <= 0) {
      setError('Price must be a positive number.');
      return;
    }

    const payload = {
      expensesName,
      description,
      category,
      price: Number(price),
      date,
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user_expense_update/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Expense updated successfully');
        navigate('/AllExpenses');
      } else {
        const data = await res.json();
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  if (!formData) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
        <span className="ml-3 text-blue-600 text-lg">Loading expense data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Edit Expense</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {(loadingHelper || loadingInfo) ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
          <span className="ml-3 text-blue-600 text-lg">Loading helper data...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Expense Name */}
          <div>
            <label className="block font-semibold">Expense Name:</label>
            <select
              className="w-full border p-2 rounded mt-1"
              name="expensesName"
              value={formData.expensesName}
              onChange={handleChange}
              required
            >
              <option value="">-- Select or enter below --</option>
              {expensesNameOptions.map((name, idx) => (
                <option key={idx} value={name}>{name}</option>
              ))}
            </select>
            <input
              className="w-full border p-2 rounded mt-2"
              type="text"
              placeholder="Or enter new expense name"
              name="expensesName"
              value={formData.expensesName}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold">Description:</label>
            <textarea
              className="w-full border p-2 rounded mt-1"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-semibold">Category:</label>
            <select
              className="w-full border p-2 rounded mt-1"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">-- Select or enter below --</option>
              {categoryOptions.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              className="w-full border p-2 rounded mt-2"
              type="text"
              placeholder="Or enter new category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            />
          </div>

          {/* Price */}
          <div>
            <label className="block font-semibold">Price (in ₹/$):</label>
            <input
              className="w-full border p-2 rounded mt-1"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block font-semibold">Date:</label>
            <input
              className="w-full border p-2 rounded mt-1"
              type="date"
              name="date"
              value={formData.date ? formData.date.slice(0, 10) : ''}
              onChange={handleChange}
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Update Expense
            </button>
            <button
              type="button"
              onClick={() => navigate('/AllExpenses')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
