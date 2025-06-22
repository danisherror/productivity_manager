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
    const [tasksPerPage, setTasksPerPage] = useState(10);
    const [loading, setLoading] = useState(true); // ✅ Loading state

    const fetchTasks = async () => {
        setLoading(true);
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
        } finally {
            setLoading(false);
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
        setCurrentPage(1);
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
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

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
        <div className="max-w-5xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6 text-center">All Scheduled Tasks</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="mb-6 flex flex-wrap gap-6 md:gap-8 items-end">
                {/* Date Filter */}
                <div className="flex flex-col">
                    <label className="font-medium mb-1" htmlFor="dateFilter">Filter by Date:</label>
                    <input
                        type="date"
                        id="dateFilter"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Search Input */}
                <div className="flex flex-col flex-grow min-w-[240px]">
                    <label className="font-medium mb-1" htmlFor="searchTerm">
                        Search (task name, category, tags, description):
                    </label>
                    <input
                        id="searchTerm"
                        type="text"
                        placeholder="e.g. work, urgent, sleep"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {/* <small className="text-gray-500 mt-1">
                        Tip: Use commas to search multiple terms (e.g. "sleep, urgent")
                    </small> */}
                </div>

                {/* Sort By Select */}
                <div className="flex flex-col">
                    <label className="font-medium mb-1" htmlFor="sortBy">Sort by:</label>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">None</option>
                        <option value="startAsc">Start Time ↑</option>
                        <option value="startDesc">Start Time ↓</option>
                        <option value="endAsc">End Time ↑</option>
                        <option value="endDesc">End Time ↓</option>
                    </select>
                </div>

                {/* Tasks Per Page */}
                <div className="flex flex-col">
                    <label className="font-medium mb-1" htmlFor="tasksPerPage">Tasks per page:</label>
                    <select
                        id="tasksPerPage"
                        value={tasksPerPage}
                        onChange={(e) => {
                            setTasksPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="border border-gray-300 rounded px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {[5, 10, 25, 50, 100].map(num => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
                    <span className="ml-3 text-blue-600 text-lg">Loading tasks...</span>
                </div>
            ) : currentTasks.length === 0 ? (
                <p className="text-center text-gray-600">No tasks found.</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white shadow rounded overflow-hidden">
                            <thead className="bg-blue-600 text-white text-sm">
                                <tr>
                                    <th className="py-3 px-4 text-left">Task</th>
                                    <th className="py-3 px-4 text-left">Category</th>
                                    <th className="py-3 px-4 text-left">Description</th>
                                    <th className="py-3 px-4 text-left">Duration (min)</th>
                                    <th className="py-3 px-4 text-left">Start</th>
                                    <th className="py-3 px-4 text-left">End</th>
                                    <th className="py-3 px-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y">
                                {currentTasks.map(task => (
                                    <tr key={task._id} className="hover:bg-gray-50">
                                        <td className="py-2 px-4">{task.taskName}</td>
                                        <td className="py-2 px-4">{task.category}</td>
                                        <td className="py-2 px-4">{task.description}</td>
                                        <td className="py-2 px-4">{task.duration}</td>
                                        <td className="py-2 px-4">{new Date(task.startTime).toLocaleString()}</td>
                                        <td className="py-2 px-4">{new Date(task.endTime).toLocaleString()}</td>
                                        <td className="py-2 px-4 space-x-2">
                                            <Link to={`/EditTask/${task._id}`} className="text-blue-500 hover:underline">Edit</Link>
                                            <button
                                                onClick={() => deleteTask(task._id)}
                                                className="text-red-500 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
                        {/* pagination buttons, unchanged logic, but Tailwind applied */}
                        {[
                            { label: '⏮ First', action: () => goToPage(1), disabled: currentPage === 1 },
                            { label: '⬅ Prev', action: () => goToPage(currentPage - 1), disabled: currentPage === 1 },
                        ].map(({ label, action, disabled }) => (
                            <button
                                key={label}
                                onClick={action}
                                disabled={disabled}
                                className={`px-3 py-1 rounded border text-sm ${disabled
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}

                        {/* page number buttons */}
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

                        {[
                            { label: 'Next ➡', action: () => goToPage(currentPage + 1), disabled: currentPage === totalPages },
                            { label: 'Last ⏭', action: () => goToPage(totalPages), disabled: currentPage === totalPages },
                        ].map(({ label, action, disabled }) => (
                            <button
                                key={label}
                                onClick={action}
                                disabled={disabled}
                                className={`px-3 py-1 rounded border text-sm ${disabled
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}