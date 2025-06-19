import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AllTasks() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/user_schedule_getAll', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setTasks(data);
        setFilteredTasks(data);
      } else {
        setError(data.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      console.error(err);
      setError('Server error');
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`http://localhost:4000/api/user_schedule_delete/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        const updated = tasks.filter(task => task._id !== id);
        setTasks(updated);
        setFilteredTasks(applyFilters(updated, selectedDate, selectedCategory, selectedTag));
      } else {
        const data = await res.json();
        alert(data.error || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  const applyFilters = (taskList, date, category, tag) => {
    return taskList.filter(task => {
      const matchesDate = !date || new Date(task.startTime).toISOString().split('T')[0] === date;
      const matchesCategory = !category || task.category === category;
      const matchesTag = !tag || (task.tags && task.tags.includes(tag));
      return matchesDate && matchesCategory && matchesTag;
    });
  };

  const handleFilterChange = () => {
    const filtered = applyFilters(tasks, selectedDate, selectedCategory, selectedTag);
    setFilteredTasks(filtered);
  };

  const resetFilters = () => {
    setSelectedDate('');
    setSelectedCategory('');
    setSelectedTag('');
    setFilteredTasks(tasks);
  };

  // Extract unique categories and tags for dropdowns
  const uniqueCategories = [...new Set(tasks.map(task => task.category).filter(Boolean))];
  const uniqueTags = [...new Set(tasks.flatMap(task => task.tags || []).filter(Boolean))];

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    handleFilterChange();
  }, [selectedDate, selectedCategory, selectedTag]);

  return (
    <div style={{ maxWidth: 900, margin: 'auto' }}>
      <h2>All Scheduled Tasks</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div>
          <label>Date:{' '}
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>Category:{' '}
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
              <option value="">All</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>Tag:{' '}
            <select value={selectedTag} onChange={e => setSelectedTag(e.target.value)}>
              <option value="">All</option>
              {uniqueTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </label>
        </div>
        <button onClick={resetFilters}>Reset</button>
      </div>

      {/* Table */}
      {filteredTasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <table border="1" cellPadding="10" width="100%">
          <thead>
            <tr>
              <th>Task</th>
              <th>Category</th>
              <th>Tags</th>
              <th>Start</th>
              <th>End</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <tr key={task._id}>
                <td>{task.taskName}</td>
                <td>{task.category}</td>
                <td>{(task.tags || []).join(', ')}</td>
                <td>{new Date(task.startTime).toLocaleString()}</td>
                <td>{new Date(task.endTime).toLocaleString()}</td>
                <td>
                  <Link to={`/EditTask/${task._id}`} style={{ marginRight: '10px' }}>Edit</Link>
                  <button onClick={() => deleteTask(task._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
