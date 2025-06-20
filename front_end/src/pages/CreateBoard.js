import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateBoard() {
  const [title, setTitle] = useState('');
  const [columns, setColumns] = useState([{ title: '' }]); // at least one column by default
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleColumnChange = (index, value) => {
    const newCols = [...columns];
    newCols[index].title = value;
    setColumns(newCols);
  };

  const addColumn = () => {
    setColumns([...columns, { title: '' }]);
  };

  const removeColumn = (index) => {
    if (columns.length === 1) return; // Must have at least one column
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Board title is required.');
      return;
    }

    if (columns.some(col => !col.title.trim())) {
      setError('All columns must have a title.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/kanban_board__create`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, columns }),
      });

      if (res.ok) {
        alert('Board created successfully!');
        navigate('/kanban'); // Adjust route as needed
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create board');
      }
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Create Kanban Board</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-1" htmlFor="title">Board Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter board title"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Columns (at least one)</label>
          {columns.map((col, idx) => (
            <div key={idx} className="flex items-center mb-2 space-x-2">
              <input
                type="text"
                value={col.title}
                onChange={e => handleColumnChange(idx, e.target.value)}
                placeholder={`Column #${idx + 1} title`}
                className="flex-grow border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeColumn(idx)}
                disabled={columns.length === 1}
                className={`px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50`}
                title="Remove column"
              >
                &times;
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addColumn}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + Add Column
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Board'}
        </button>
      </form>
    </div>
  );
}
