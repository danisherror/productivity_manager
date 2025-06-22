import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);
  const [taskNameOptions, setTaskNameOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loadingHelper, setHelperLoading] = useState(true);
  const [loadingInfo, setInfoLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      setInfoLoading(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user_schedule_getByID/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) setFormData(data);
        else setError(data.error || 'Could not fetch task');
      } catch (err) {
        setError('Server error');
      } finally {
        setInfoLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  useEffect(() => {
    const fetchHelperData = async () => {
      setHelperLoading(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user_schedule_helper`, {
          credentials: 'include',
        });
        const data = await res.json();
        setTaskNameOptions(data.taskNames || []);
        setCategoryOptions(data.categories || []);
      } catch (err) {
        console.error('Failed to fetch helper data');
      } finally {
        setHelperLoading(false);
      }
    };
    fetchHelperData();
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    const {
      taskName,
      description,
      category,
      startTime,
      endTime,
      isCompleted,
      mood,
      productivityScore,
      energyLevel,
    } = formData;

    if (!taskName || !category || !startTime || !endTime) {
      setError('Please fill all required fields.');
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError('End Time must be after Start Time.');
      return;
    }

    const payload = {
      taskName,
      description,
      category,
      tags: category,
      startTime,
      endTime,
      isCompleted,
      productivityScore: productivityScore ? Number(productivityScore) : null,
      mood,
      energyLevel: energyLevel ? Number(energyLevel) : 5,
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user_schedule_update/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Edited successfully');
        navigate('/AllScheduleTasks');
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
        <span className="ml-3 text-blue-600 text-lg">Loading task data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {(loadingHelper || loadingInfo) ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
          <span className="ml-3 text-blue-600 text-lg">Loading helper data...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold">Task Name:</label>
            <select
              className="w-full border p-2 rounded mt-1"
              value={formData.taskName}
              onChange={e => setFormData(prev => ({ ...prev, taskName: e.target.value }))}
            >
              <option value="">-- Select or enter below --</option>
              {taskNameOptions.map((name, idx) => (
                <option key={idx} value={name}>{name}</option>
              ))}
            </select>
            <input
              className="w-full border p-2 rounded mt-2"
              type="text"
              placeholder="Or enter new task name"
              name="taskName"
              value={formData.taskName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block font-semibold">Description:</label>
            <textarea
              className="w-full border p-2 rounded mt-1"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block font-semibold">Category:</label>
            <select
              className="w-full border p-2 rounded mt-1"
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
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

          <div>
            <label className="block font-semibold">Start Time:</label>
            <input
              className="w-full border p-2 rounded mt-1"
              type="datetime-local"
              name="startTime"
              value={new Date(formData.startTime).toISOString().slice(0, 16)}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block font-semibold">End Time:</label>
            <input
              className="w-full border p-2 rounded mt-1"
              type="datetime-local"
              name="endTime"
              value={new Date(formData.endTime).toISOString().slice(0, 16)}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Update Task
            </button>
            <button
              type="button"
              onClick={() => navigate('/AllScheduleTasks')}
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