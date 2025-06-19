import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AllTasks() {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
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
                setFilteredTasks(filterTasksByDate(updated, selectedDate));
            } else {
                const data = await res.json();
                alert(data.error || 'Delete failed');
            }
        } catch (err) {
            console.error(err);
            alert('Server error');
        }
    };

    const filterTasksByDate = (taskList, date) => {
        if (!date) return taskList;
        console.log(taskList)
        console.log(date)
        return taskList.filter(task => {
            const taskStartDate = new Date(task.startTime).toISOString().split('T')[0];
            const taskEndDate = new Date(task.endTime).toISOString().split('T')[0];
            return (taskStartDate === date) || (taskEndDate===date);
        });
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        setFilteredTasks(filterTasksByDate(tasks, date));
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div style={{ maxWidth: 800, margin: 'auto' }}>
            <h2>All Scheduled Tasks</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ marginBottom: '15px' }}>
                <label>
                    Filter by Start Date:{' '}
                    <input type="date" value={selectedDate} onChange={handleDateChange} />
                    {' '}
                    <button onClick={() => {
                        setSelectedDate('');
                        setFilteredTasks(tasks);
                    }}>
                        Reset
                    </button>
                </label>
            </div>

            {filteredTasks.length === 0 ? (
                <p>No tasks found.</p>
            ) : (
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
                        {filteredTasks.map(task => (
                            <tr key={task._id}>
                                <td>{task.taskName}</td>
                                <td>{task.category}</td>
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
