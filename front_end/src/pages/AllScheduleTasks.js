import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AllTasks() {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // Fetch all tasks from backend
    const fetchTasks = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/user_schedule_getAll', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                setTasks(data);
                setFilteredTasks(data); // Set initial
            } else {
                setError('Failed to fetch tasks');
            }
        } catch (err) {
            setError('Server error');
        }
    };

    // Filter logic
    const applyFilters = (taskList, date, search) => {
        const terms = search
            .split(',')
            .map(t => t.trim().toLowerCase())
            .filter(Boolean);

        return taskList.filter(task => {
            const matchesDate = !date || new Date(task.startTime).toISOString().split('T')[0] === date;

            const matchesSearch = terms.length === 0 || terms.some(term => {
                return (
                    task.taskName?.toLowerCase().includes(term) ||
                    task.category?.toLowerCase().includes(term) ||
                    task.description?.toLowerCase().includes(term) ||
                    (task.tags || []).some(tag => tag.toLowerCase().includes(term))
                );
            });

            return matchesDate && matchesSearch;
        });
    };

    // Re-filter whenever tasks/searchTerm/date changes
    useEffect(() => {
        const filtered = applyFilters(tasks, dateFilter, searchTerm);
        setFilteredTasks(filtered);
    }, [searchTerm, dateFilter, tasks]);

    // Delete task by ID
    const deleteTask = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            const res = await fetch(`http://localhost:4000/api/user_schedule_delete/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.status === 200) {
                setTasks(tasks.filter(task => task._id !== id));
            } else {
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
        <div style={{ maxWidth: 900, margin: 'auto' }}>
            <h2>All Scheduled Tasks</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ marginBottom: '20px' }}>
                <label>
                    Filter by Date:&nbsp;
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                    />
                </label>
                <br /><br />
                <label>
                    Search (in task name, category, tags, description):&nbsp;
                    <input
                        type="text"
                        placeholder="e.g. work, urgent, sleep"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </label>
                <small style={{ color: '#666' }}>
                    Tip: Use commas to search multiple terms (e.g. "sleep, urgent")
                </small>
            </div>

            {filteredTasks.length === 0 ? <p>No tasks found.</p> : (
                <table border="1" cellPadding="10" width="100%">
                    <thead>
                        <tr>
                            <th>Task</th>
                            <th>Category</th>
                            <th>Tags</th>
                            <th>Description</th>
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
                                <td>{task.description}</td>
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
