import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditDailyProductivity() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch productivity record by ID
  useEffect(() => {
    const fetchProductivity = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user_daily_Productivity_getByID/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          // Convert date to YYYY-MM-DD for input[type=date] value
          setFormData({
            ...data,
            date: data.date ? data.date.slice(0, 10) : '',
          });
        } else {
          setError(data.error || 'Failed to fetch productivity record.');
        }
      } catch {
        setError('Server error.');
      } finally {
        setLoading(false);
      }
    };
    fetchProductivity();
  }, [id]);

  // Handle form input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submit
  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    const { date, description, productivityScore } = formData;

    if (!date) {
      setError('Date is required.');
      return;
    }

    if (productivityScore === '' || productivityScore === null) {
      setError('Productivity score is required.');
      return;
    }

    const scoreNum = Number(productivityScore);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10) {
      setError('Productivity score must be a number between 0 and 10.');
      return;
    }

    const payload = {
      date,
      description,
      productivityScore: scoreNum,
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user_daily_Productivity_update/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Daily productivity updated successfully!');
        navigate('/daily-productivity'); // Adjust this route to your listing page
      } else {
        const data = await res.json();
        setError(data.error || 'Update failed.');
      }
    } catch {
      setError('Server error.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
        <span className="ml-3 text-blue-600 text-lg">Loading productivity data...</span>
      </div>
    );
  }

  if (!formData) {
    return <p className="text-center text-red-600 mt-10">No productivity data found.</p>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Edit Daily Productivity</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block font-semibold mb-1">
            Date:
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="description" className="block font-semibold mb-1">
            Description:
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={4}
          />
        </div>

        <div>
          <label htmlFor="productivityScore" className="block font-semibold mb-1">
            Productivity Score (0-10):
          </label>
          <input
            type="number"
            id="productivityScore"
            name="productivityScore"
            min="0"
            max="10"
            value={formData.productivityScore ?? ''}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update
          </button>
          <button
            type="button"
            onClick={() => navigate('/daily-productivity')} // Change to your daily productivity listing page route
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
