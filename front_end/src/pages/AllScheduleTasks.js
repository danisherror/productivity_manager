import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AllTasks() {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [tasksPerPage, setTasksPerPage] = useState(10); // Dropdown-controlled

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
            const taskStart = new Date(task.startTime);
            const taskEnd = new Date(task.endTime);

            let matchesDate = true;
            if (date) {
                const selected = new Date(date);
                selected.setHours(0, 0, 0, 0);
                taskStart.setHours(0, 0, 0, 0);
                taskEnd.setHours(0, 0, 0, 0);

                matchesDate = selected >= taskStart && selected <= taskEnd;
            }

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
        setCurrentPage(1); // Reset to first page on filter change
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

    // Pagination logic
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div style={{ maxWidth: 900, margin: 'auto' }}>
            <h2>All Scheduled Tasks</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ marginBottom: '20px' }}>
                <label>
                    Filter by Date:&nbsp;
                    <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
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
                <br /><br />
                <label>
                    Tasks per page:&nbsp;
                    <select
                        value={tasksPerPage}
                        onChange={(e) => {
                            setTasksPerPage(Number(e.target.value));
                            setCurrentPage(1); // Reset to page 1 on page size change
                        }}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </label>
            </div>

            {currentTasks.length === 0 ? (
                <p>No tasks found.</p>
            ) : (
                <>
                    <table border="1" cellPadding="10" width="100%">
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Dura in mins</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTasks.map(task => (
                                <tr key={task._id}>
                                    <td>{task.taskName}</td>
                                    <td>{task.category}</td>
                                    <td>{task.description}</td>
                                    <td>{task.duration}</td>
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

                    {/* <div style={{ textAlign: 'center', marginTop: '20px' }}> */}
                    {/* Pagination Controls with Ellipsis */}
                    <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
                        <button
                            onClick={() => goToPage(1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded border text-sm ${currentPage === 1
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                                }`}
                        >
                            ⏮ First
                        </button>

                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded border text-sm ${currentPage === 1
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                                }`}
                        >
                            ⬅ Prev
                        </button>

                        {/* Pagination Numbers */}
                        {(() => {
                            const pageButtons = [];
                            const maxVisible = 5;
                            let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                            let end = start + maxVisible - 1;

                            if (end > totalPages) {
                                end = totalPages;
                                start = Math.max(1, end - maxVisible + 1);
                            }

                            if (start > 1) {
                                pageButtons.push(
                                    <button
                                        key={1}
                                        onClick={() => goToPage(1)}
                                        className="px-3 py-1 rounded border text-sm bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                                    >
                                        1
                                    </button>
                                );
                                if (start > 2) {
                                    pageButtons.push(
                                        <span key="start-ellipsis" className="px-2 text-gray-500">...</span>
                                    );
                                }
                            }

                            for (let i = start; i <= end; i++) {
                                pageButtons.push(
                                    <button
                                        key={i}
                                        onClick={() => goToPage(i)}
                                        className={`px-3 py-1 rounded border text-sm ${currentPage === i
                                                ? 'bg-blue-500 text-white font-semibold'
                                                : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                                            }`}
                                    >
                                        {i}
                                    </button>
                                );
                            }

                            if (end < totalPages) {
                                if (end < totalPages - 1) {
                                    pageButtons.push(
                                        <span key="end-ellipsis" className="px-2 text-gray-500">...</span>
                                    );
                                }
                                pageButtons.push(
                                    <button
                                        key={totalPages}
                                        onClick={() => goToPage(totalPages)}
                                        className="px-3 py-1 rounded border text-sm bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                                    >
                                        {totalPages}
                                    </button>
                                );
                            }

                            return pageButtons;
                        })()}

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded border text-sm ${currentPage === totalPages
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                                }`}
                        >
                            Next ➡
                        </button>

                        <button
                            onClick={() => goToPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded border text-sm ${currentPage === totalPages
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                                }`}
                        >
                            Last ⏭
                        </button>
                    </div>

                </>
            )}
        </div>
    );
}
