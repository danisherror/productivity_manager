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
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Edit Task</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {(loadingHelper || loadingInfo) ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
          <span className="ml-3 text-blue-600 text-lg">Loading helper data...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>

          {/* Task Name */}
          <label>Task Name:<br />
            <select
              value={formData.taskName}
              onChange={e => setFormData(prev => ({ ...prev, taskName: e.target.value }))}
              style={{ width: '100%' }}
            >
              <option value="">-- Select or enter below --</option>
              {taskNameOptions.map((name, idx) => (
                <option key={idx} value={name}>{name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or enter new task name"
              name="taskName"
              value={formData.taskName}
              onChange={handleChange}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </label><br /><br />

          {/* Description */}
          <label>Description:<br />
            <textarea name="description" value={formData.description} onChange={handleChange} style={{ width: '100%' }} />
          </label><br /><br />

          {/* Category */}
          <label>Category:<br />
            <select
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
              style={{ width: '100%' }}
            >
              <option value="">-- Select or enter below --</option>
              {categoryOptions.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or enter new category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </label><br /><br />

          {/* Start Time */}
          <label>Start Time:<br />
            <input
              type="datetime-local"
              name="startTime"
              value={new Date(formData.startTime).toISOString().slice(0, 16)}
              onChange={handleChange}
              required
              style={{ width: '100%' }}
            />
          </label><br /><br />

          {/* End Time */}
          <label>End Time:<br />
            <input
              type="datetime-local"
              name="endTime"
              value={new Date(formData.endTime).toISOString().slice(0, 16)}
              onChange={handleChange}
              required
              style={{ width: '100%' }}
            />
          </label><br /><br />

          {/* Productivity Score */}
          {/* <label>Productivity Score:<br />
            <input
              name="productivityScore"
              type="number"
              min="0"
              max="10"
              value={formData.productivityScore}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
          </label><br /><br /> */}

          {/* Submit */}
          <button type="submit">Update Task</button>
          <button type="button" onClick={() => navigate('/AllScheduleTasks')} style={{ marginLeft: 10 }}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
