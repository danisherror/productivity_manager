// AllTasks.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AllTasks() {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState(null);

    const fetchTasks = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/user_schedule_getAll', {
                method: 'GET', 
                credentials: 'include' });
            const data = await res.json();
            if (res.ok) setTasks(data);
            else setError('Failed to fetch tasks');
        } catch (err) {
            setError('Server error');
        }
    };

    const deleteTask = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            const res = await fetch(`http://localhost:4000/api/user_schedule_delete/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            console.log(res);
            if (res.status === 200) {
                setTasks(tasks.filter(task => task._id !== id));
            } else {
                const data = await res.data;
                alert('Delete failed');
            }
        } catch (err) {
            alert('Server error');
            console.log(err);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div style={{ maxWidth: 800, margin: 'auto' }}>
            <h2>All Scheduled Tasks</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {tasks.length === 0 ? <p>No tasks found.</p> : (
                <table border="1" cellPadding="10" width="100%">
                    <thead>
                        <tr>
                            <th>Task</th>
                            <th>Category</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task._id}>
                                <td>{task.taskName}</td>
                                <td>{task.category}</td>
                                <td>{new Date(task.startTime).toLocaleString()}</td>
                                <td>{new Date(task.endTime).toLocaleString()}</td>
                                <td>
                                    <Link to={`/edit-task/${task._id}`}>Edit</Link> |{' '}
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