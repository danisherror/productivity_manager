import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateDailyProductivity() {
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [score, setScore] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError('Date is required.');
      return;
    }

    const scoreValue = parseInt(score, 10);
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 10) {
      setError('Productivity score must be between 0 and 10.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user_daily_Productivity_create`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          description,
          productivityScore: scoreValue,
        }),
      });

      if (res.ok) {
        alert('Daily productivity entry created successfully!');
        navigate('/daily-productivity'); // Change route as needed
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create entry');
      }
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Add Daily Productivity</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="date" className="block font-medium mb-1">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block font-medium mb-1">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What did you do today?"
          />
        </div>

        <div>
          <label htmlFor="score" className="block font-medium mb-1">Productivity Score (0–10)</label>
          <input
            id="score"
            type="number"
            value={score}
            onChange={e => setScore(e.target.value)}
            min="0"
            max="10"
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a score"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Entry'}
        </button>
      </form>
    </div>
  );
}
