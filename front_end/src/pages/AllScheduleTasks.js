import React, { useEffect, useState } from 'react';

export default function AllScheduleTasks() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const fetchAllTasks = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/user_schedule_getAll', {
        method: 'GET',
        credentials: 'include', // include cookies for auth
      });

      if (!response.ok) {
        const err = await response.json();
        setError(err.error || 'Failed to fetch tasks');
        return;
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError('Server error. Please try again.');
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: 'auto' }}>
      <h2>User Schedule Tasks</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f2f2f2' }}>
              <th>Task Name</th>
              <th>Category</th>
              <th>Start</th>
              <th>End</th>
              <th>Duration</th>
              <th>Completed</th>
              <th>Productivity</th>
              <th>Mood</th>
              <th>Energy</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task._id}>
                <td>{task.taskName}</td>
                <td>{task.category}</td>
                <td>{new Date(task.startTime).toLocaleString()}</td>
                <td>{new Date(task.endTime).toLocaleString()}</td>
                <td>{task.duration}</td>
                <td>{task.isCompleted ? '✅' : '❌'}</td>
                <td>{task.productivityScore ?? '-'}</td>
                <td>{task.mood}</td>
                <td>{task.energyLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
