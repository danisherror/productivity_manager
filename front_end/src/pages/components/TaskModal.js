import React, { useEffect, useState } from 'react';
import api from '../../api';

export default function TaskModal({ boardId, task, isCreate, onClose, columns }) {
  const [title, setTitle] = useState('');
  const [columnTitle, setColumnTitle] = useState(columns[0]?.title || '');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setColumnTitle(task.columnTitle || columns[0]?.title || '');
      setPriority(task.priority || 'Medium');
      setDescription(task.description || '');
    } else {
      setTitle('');
      setColumnTitle(columns[0]?.title || '');
      setPriority('Medium');
      setDescription('');
    }
  }, [task, columns]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isCreate) {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/kanban_task/${boardId}/tasks`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          columnTitle,
          priority,
          description,
        }),
      });
      } else {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/kanban_task/${boardId}/tasks/${task._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          columnTitle,
          priority,
          description,
        }),
      });
      }
      onClose();
    } catch (error) {
      alert('Failed to save task');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow max-w-md w-full"
      >
        <h3 className="text-lg font-semibold mb-4">
          {isCreate ? 'Create New Task' : 'Edit Task'}
        </h3>

        <label className="block mb-2 font-medium">
          Title:
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
          />
        </label>

        <label className="block mb-2 font-medium">
          Column:
          <select
            value={columnTitle}
            onChange={e => setColumnTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
          >
            {columns.map(col => (
              <option key={col.title} value={col.title}>
                {col.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-2 font-medium">
          Priority:
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>

        <label className="block mb-4 font-medium">
          Description:
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded mt-1"
          />
        </label>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isCreate ? 'Create' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
