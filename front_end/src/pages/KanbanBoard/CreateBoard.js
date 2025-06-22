import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateBoard() {
  const [title, setTitle] = useState('');
  const [columns, setColumns] = useState([{ title: '' }]);
  const [description, setDescription] = useState('');
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
    if (columns.length === 1) return;
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

    const duplicateTitles = columns
      .map(c => c.title.trim())
      .filter((t, i, arr) => t && arr.indexOf(t) !== i);
    if (duplicateTitles.length > 0) {
      setError(`Duplicate column title: "${duplicateTitles[0]}"`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/kanban_board__create`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, columns }),
      });

      if (res.ok) {
        alert('Board created successfully!');
        setTitle('');
        setDescription('');
        setColumns([{ title: '' }]);
        navigate('/kanban');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create board');
      }
    } catch (err) {
      setError('Server error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-6">
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
          <label className="block font-medium mb-1" htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Columns</label>
          {columns.map((col, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={col.title}
                onChange={e => handleColumnChange(idx, e.target.value)}
                placeholder={`Column #${idx + 1} title`}
                className="flex-1 border border-gray-300 rounded-md p-2"
              />
              <button
                type="button"
                onClick={() => removeColumn(idx)}
                disabled={columns.length === 1}
                className="text-red-600 font-bold px-2 py-1 border border-red-600 rounded hover:bg-red-100 disabled:opacity-50"
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
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
              Creating...
            </div>
          ) : 'Create Board'}
        </button>
      </form>
    </div>
  );
}
