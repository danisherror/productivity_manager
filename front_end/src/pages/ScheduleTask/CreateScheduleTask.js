import React, { useState, useEffect } from 'react';

export default function CreateScheduleTask() {
  const emptyTask = {
    taskName: '',
    customTaskName: '',
    description: '',
    category: '',
    customCategory: '',
    startTime: '',
    endTime: '',
  };

  const [tasks, setTasks] = useState([emptyTask]);
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

  const handleTaskChange = (index, e) => {
    const { name, value } = e.target;
    setTasks(prev =>
      prev.map((task, i) =>
        i === index ? { ...task, [name]: value } : task
      )
    );
  };

  const addTaskForm = () => {
    setTasks([...tasks, emptyTask]);
  };

  const removeTaskForm = index => {
    if (tasks.length === 1) return;
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const preparedTasks = tasks.map(task => ({
      ...task,
      taskName: task.taskName === '__custom__' ? task.customTaskName : task.taskName,
      category: task.category === '__custom__' ? task.customCategory : task.category,
    }));

    const invalid = preparedTasks.some(task =>
      !task.taskName || !task.category || !task.startTime || !task.endTime
    );

    if (invalid) {
      setError('All tasks must include: Task Name, Category, Start Time, End Time');
      return;
    }

    try {
      const responses = await Promise.all(
        preparedTasks.map(task =>
          fetch(`${process.env.REACT_APP_BACKEND_URL}/user_schedule_create`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...task,
              tags: task.category,
              isCompleted: true,
              productivityScore: 0,
              mood: 'Neutral',
              energyLevel: 5,
            }),
          })
        )
      );

      const failed = [];
      for (let i = 0; i < responses.length; i++) {
        if (!responses[i].ok) {
          const errData = await responses[i].json();
          failed.push(`Task ${i + 1}: ${errData.error || 'Unknown error'}`);
        }
      }

      if (failed.length > 0) {
        setError(failed.join('\n'));
      } else {
        setMessage('All tasks created successfully!');
        setTasks([emptyTask]);
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Create Multiple Schedule Tasks</h2>
      {error && <p className="text-red-600 whitespace-pre-line mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          <span className="ml-3 text-blue-600 text-lg">Loading...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {tasks.map((task, index) => (
            <div key={`task-${index}`} className="p-4 border rounded shadow-sm space-y-4 relative">
              <button
                type="button"
                onClick={() => removeTaskForm(index)}
                className="absolute top-2 right-2 text-red-500 hover:underline"
                disabled={tasks.length === 1}
              >
                Remove
              </button>

              {/* Task Name */}
              <div>
                <label className="block font-medium">Task Name*</label>
                <select
                  value={task.taskName}
                  onChange={e => handleTaskChange(index, e)}
                  name="taskName"
                  className="w-full border px-3 py-2 rounded mt-1"
                >
                  <option value="">-- Select task name --</option>
                  {taskNameOptions.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                  <option value="__custom__">Other</option>
                </select>
                {task.taskName === '__custom__' && (
                  <input
                    type="text"
                    placeholder="Enter custom task name"
                    name="customTaskName"
                    value={task.customTaskName}
                    onChange={e => handleTaskChange(index, e)}
                    className="w-full border px-3 py-2 rounded mt-2"
                  />
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium">Description</label>
                <textarea
                  name="description"
                  value={task.description}
                  onChange={e => handleTaskChange(index, e)}
                  rows={2}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-medium">Category*</label>
                <select
                  value={task.category}
                  onChange={e => handleTaskChange(index, e)}
                  name="category"
                  className="w-full border px-3 py-2 rounded mt-1"
                >
                  <option value="">-- Select category --</option>
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__custom__">Other</option>
                </select>
                {task.category === '__custom__' && (
                  <input
                    type="text"
                    placeholder="Enter custom category"
                    name="customCategory"
                    value={task.customCategory}
                    onChange={e => handleTaskChange(index, e)}
                    className="w-full border px-3 py-2 rounded mt-2"
                  />
                )}
              </div>

              {/* Start Time */}
              <div>
                <label className="block font-medium">Start Time*</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={task.startTime}
                  onChange={e => handleTaskChange(index, e)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block font-medium">End Time*</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={task.endTime}
                  onChange={e => handleTaskChange(index, e)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
            </div>
          ))}

          {/* Add & Submit Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={addTaskForm}
              className="text-blue-600 hover:underline"
            >
              + Add another task
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Submit All Tasks
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
