import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AllExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [expensesPerPage, setExpensesPerPage] = useState(10);
    const [loading, setLoading] = useState(true);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user_expense_getAll`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                setExpenses(data);
                setFilteredExpenses(data);
            } else {
                setError('Failed to fetch expenses');
            }
        } catch (err) {
            setError('Server error');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = (list, date, search) => {
        const terms = search
            .split(',')
            .map(t => t.trim().toLowerCase())
            .filter(Boolean);

        let filtered = list.filter(exp => {
            const matchesSearch =
                terms.length === 0 ||
                terms.some(term =>
                    exp.expensesName?.toLowerCase().includes(term) ||
                    exp.category?.toLowerCase().includes(term) ||
                    exp.description?.toLowerCase().includes(term)
                );

            let matchesDate = true;
            if (date && exp.date) {
                const selectedDate = new Date(date).toISOString().slice(0, 10);
                const expenseDate = new Date(exp.date).toISOString().slice(0, 10);
                matchesDate = selectedDate === expenseDate;
            }

            return matchesSearch && matchesDate;
        });

        if (sortBy === 'priceAsc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'priceDesc') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'dateAsc') {
            filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (sortBy === 'dateDesc') {
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        return filtered;
    };

    useEffect(() => {
        const filtered = applyFilters(expenses, dateFilter, searchTerm);
        setFilteredExpenses(filtered);
        setCurrentPage(1);
    }, [searchTerm, dateFilter, sortBy, expenses]);

    const deleteExpense = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user_expense_delete/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.status === 200) {
                setExpenses(expenses.filter(exp => exp._id !== id));
            } else {
                alert('Delete failed');
            }
        } catch (err) {
            alert('Server error');
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const indexOfLast = currentPage * expensesPerPage;
    const indexOfFirst = indexOfLast - expensesPerPage;
    const currentExpenses = filteredExpenses.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredExpenses.length / expensesPerPage);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };



    return (
        <div className="max-w-5xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6 text-center">All Expenses</h2>
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
                        Search (tags, description):
                    </label>
                    <input
                        id="searchTerm"
                        type="text"
                        placeholder="e.g. food, rent, groceries"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Sort By */}
                <div className="flex flex-col">
                    <label className="font-medium mb-1" htmlFor="sortBy">Sort by:</label>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">None</option>
                        <option value="priceAsc">Amount ↑</option>
                        <option value="priceDesc">Amount ↓</option>
                        <option value="dateAsc">Date ↑</option>
                        <option value="dateDesc">Date ↓</option>
                    </select>
                </div>

                {/* Per Page */}
                <div className="flex flex-col">
                    <label className="font-medium mb-1" htmlFor="expensesPerPage">Expenses per page:</label>
                    <select
                        id="expensesPerPage"
                        value={expensesPerPage}
                        onChange={(e) => {
                            setExpensesPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="border border-gray-300 rounded px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {[5, 10, 25, 50].map(num => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
                    <span className="ml-3 text-blue-600 text-lg">Loading expenses...</span>
                </div>
            ) : currentExpenses.length === 0 ? (
                <p className="text-center text-gray-600">No expenses found.</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white shadow rounded overflow-hidden">
                            <thead className="bg-blue-600 text-white text-sm">
                                <tr>
                                    <th className="py-3 px-4 text-left">Expense Name</th>
                                    <th className="py-3 px-4 text-left">Amount</th>
                                    <th className="py-3 px-4 text-left">Description</th>
                                    <th className="py-3 px-4 text-left">Date</th>
                                    <th className="py-3 px-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y">
                                {currentExpenses.map(expense => (
                                    <tr key={expense._id} className="hover:bg-gray-50">
                                        <td className="py-2 px-4">{expense.expensesName}</td>
                                        <td className="py-2 px-4">₹{expense.price}</td>
                                        <td className="py-2 px-4">{expense.description || '-'}</td>
                                        <td className="py-2 px-4">
                                            {expense.date
                                                ? new Date(expense.date).toLocaleDateString()
                                                : '-'}
                                        </td>
                                        <td className="py-2 px-4 space-x-2">
                                            <Link to={`/editExpense/${expense._id}`} className="text-blue-500 hover:underline">Edit</Link>
                                            <button
                                                onClick={() => deleteExpense(expense._id)}
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

                    {/* Pagination */}
                    <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
                        {[{ label: '⏮ First', action: () => goToPage(1), disabled: currentPage === 1 },
                        { label: '⬅ Prev', action: () => goToPage(currentPage - 1), disabled: currentPage === 1 }].map(({ label, action, disabled }) => (
                            <button
                                key={label}
                                onClick={action}
                                disabled={disabled}
                                className={`px-3 py-1 rounded border text-sm ${disabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'}`}
                            >
                                {label}
                            </button>
                        ))}

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
                                pageButtons.push(<button key={1} onClick={() => goToPage(1)} className="px-3 py-1 rounded border text-sm bg-white text-blue-600 border-blue-300 hover:bg-blue-50">1</button>);
                                if (start > 2) pageButtons.push(<span key="start-ellipsis" className="px-2 text-gray-500">...</span>);
                            }

                            for (let i = start; i <= end; i++) {
                                pageButtons.push(
                                    <button key={i} onClick={() => goToPage(i)} className={`px-3 py-1 rounded border text-sm ${currentPage === i ? 'bg-blue-500 text-white font-semibold' : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'}`}>
                                        {i}
                                    </button>
                                );
                            }

                            if (end < totalPages) {
                                if (end < totalPages - 1) pageButtons.push(<span key="end-ellipsis" className="px-2 text-gray-500">...</span>);
                                pageButtons.push(<button key={totalPages} onClick={() => goToPage(totalPages)} className="px-3 py-1 rounded border text-sm bg-white text-blue-600 border-blue-300 hover:bg-blue-50">{totalPages}</button>);
                            }

                            return pageButtons;
                        })()}

                        {[{ label: 'Next ➡', action: () => goToPage(currentPage + 1), disabled: currentPage === totalPages },
                        { label: 'Last ⏭', action: () => goToPage(totalPages), disabled: currentPage === totalPages }].map(({ label, action, disabled }) => (
                            <button key={label} onClick={action} disabled={disabled} className={`px-3 py-1 rounded border text-sm ${disabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );


}