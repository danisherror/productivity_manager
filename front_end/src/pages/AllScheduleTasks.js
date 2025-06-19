import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AllTasks() {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [sortBy, setSortBy] = useState('');

    const fetchTasks = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user_schedule_getAll`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                setTasks(data);
                setFilteredTasks(data);
            } else {
                setError('Failed to fetch tasks');
            }
        } catch (err) {
            setError('Server error');
        }
    };

    const applyFilters = (taskList, date, search) => {
        const terms = search
            .split(',')
            .map(t => t.trim().toLowerCase())
            .filter(Boolean);

        let filtered = taskList.filter(task => {
            const matchesDate = !date || new Date(task.startTime).toISOString().split('T')[0] === date;
            const matchesSearch = terms.length === 0 || terms.some(term =>
                task.taskName?.toLowerCase().includes(term) ||
                task.category?.toLowerCase().includes(term) ||
                task.description?.toLowerCase().includes(term) ||
                (task.tags || []).some(tag => tag.toLowerCase().includes(term))
            );
            return matchesDate && matchesSearch;
        });

        if (sortBy === 'startAsc') {
            filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        } else if (sortBy === 'startDesc') {
            filtered.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        } else if (sortBy === 'endAsc') {
            filtered.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
        } else if (sortBy === 'endDesc') {
            filtered.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
        }

        return filtered;
    };

    useEffect(() => {
        const filtered = applyFilters(tasks, dateFilter, searchTerm);
        setFilteredTasks(filtered);
    }, [searchTerm, dateFilter, sortBy, tasks]);

    const deleteTask = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user_schedule_delete/${id}`, {
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
                <br /><br />
                <label>
                    Sort by:&nbsp;
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option value="">None</option>
                        <option value="startAsc">Start Time ↑</option>
                        <option value="startDesc">Start Time ↓</option>
                        <option value="endAsc">End Time ↑</option>
                        <option value="endDesc">End Time ↓</option>
                    </select>
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
                                    <Link to={`/EditTask/${task._id}`}>Edit</Link> |{' '}
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
