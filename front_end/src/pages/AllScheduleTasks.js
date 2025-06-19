import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AllTasks() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
        setFilteredTasks(applyFilters(updated, selectedDate, searchTerm));
      } else {
        const data = await res.json();
        alert(data.error || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  const applyFilters = (taskList, date, search) => {
    return taskList.filter(task => {
      const matchesDate = !date || new Date(task.startTime).toISOString().split('T')[0] === date;

      const lowerSearch = search.toLowerCase();
      const matchesSearch =
        !search ||
        task.taskName?.toLowerCase().includes(lowerSearch) ||
        task.category?.toLowerCase().includes(lowerSearch) ||
        task.description?.toLowerCase().includes(lowerSearch) ||
        (task.tags || []).some(tag => tag.toLowerCase().includes(lowerSearch));

      return matchesDate && matchesSearch;
    });
  };

  const handleFilterChange = () => {
    const filtered = applyFilters(tasks, selectedDate, searchTerm);
    setFilteredTasks(filtered);
  };

  const resetFilters = () => {
    setSelectedDate('');
    setSearchTerm('');
    setFilteredTasks(tasks);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    handleFilterChange();
  }, [selectedDate, searchTerm]);

  return (
    <div style={{ maxWidth: 900, margin: 'auto' }}>
      <h2>All Scheduled Tasks</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Filter Controls */}
      <div style={{
        marginBottom: '20px',
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
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
          <label>Search:{' '}
            <input
              type="text"
              placeholder="Search category, tag, title, description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '280px' }}
            />
          </label>
        </div>
        <button onClick={resetFilters}>Reset</button>
      </div>

      {/* Table Display */}
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
