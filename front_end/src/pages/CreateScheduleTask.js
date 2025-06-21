import React, { useState, useEffect } from 'react';

export default function CreateScheduleTask() {
  const [formData, setFormData] = useState({
    taskName: '',
    description: '',
    category: '',
    startTime: '',
    endTime: '',
  });

  const [taskNameOptions, setTaskNameOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaskHelperData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user_schedule_helper`, {
          credentials: 'include',
        });
        const data = await response.json();
        setTaskNameOptions(data.taskNames || []);
        setCategoryOptions(data.categories || []);
      } catch (err) {
        console.error('Failed to fetch task helper data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTaskHelperData();
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
    setMessage(null);
    setError(null);

    if (!formData.taskName || !formData.category || !formData.startTime || !formData.endTime) {
      setError('Please fill in required fields: Task Name, Category, Start Time, End Time');
      return;
    }

    const { taskName, description, category, startTime, endTime } = formData;

    const payload = {
      taskName,
      description,
      category,
      tags: category,
      startTime,
      endTime,
      isCompleted: true,
      productivityScore: 0,
      mood: 'Neutral',
      energyLevel: 5,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user_schedule_create`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create task');
      } else {
        alert('Registered successfully!');
        setMessage('Task created successfully!');
        setFormData({
          taskName: '',
          description: '',
          category: '',
          startTime: '',
          endTime: '',
        });
      }
    } catch (err) {
      setError('Server error. Please try again.');
      console.error(err);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 13000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Create Schedule Task</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
          <span className="ml-3 text-blue-600 text-lg">Loading tasks...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Name */}
          <div>
            <label className="block mb-1 font-medium">Task Name*</label>
            <select
              value={formData.taskName}
              onChange={e => setFormData(prev => ({ ...prev, taskName: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">-- Select a task or enter below --</option>
              {taskNameOptions.map((name, idx) => (
                <option key={idx} value={name}>{name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or enter new task name"
              value={formData.taskName}
              onChange={handleChange}
              name="taskName"
              className="w-full border border-gray-300 rounded px-3 py-2 mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block mb-1 font-medium">Category*</label>
            <select
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">-- Select a category or enter below --</option>
              {categoryOptions.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or enter new category"
              value={formData.category}
              onChange={handleChange}
              name="category"
              className="w-full border border-gray-300 rounded px-3 py-2 mt-2"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block mb-1 font-medium">Start Time*</label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block mb-1 font-medium">End Time*</label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Create Task
            </button>
          </div>
        </form>
      )}
    </div>
  );
}