import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import TaskAnalysisAnimatedBars from './TaskAnalysisAnimatedBars'; // reuse animated bars component

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BF6', '#F67280'];

const parameters = ['category', 'expensesName'];
const paramLabels = {
  category: 'Category',
  expensesName: 'Expense Name',
};

const ExpenseAnalysis = () => {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedParam, setSelectedParam] = useState(parameters[0]);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    count: 0,
    averagePrice: 0,
  });

  // Helper: filter by date range
  const isWithinRange = (dateStr, from, to) => {
    const d = new Date(dateStr);
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    if (fromDate && toDate && fromDate.toDateString() === toDate.toDateString()) {
      toDate.setHours(23, 59, 59, 999);
    }
    return (!fromDate || d >= fromDate) && (!toDate || d <= toDate);
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_BACKEND_URL}/user_expense_getAll`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setExpenses(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch expenses.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const filtered = expenses.filter(exp => isWithinRange(exp.date, startDate, endDate));

    const totalAmount = filtered.reduce((sum, e) => sum + (e.price || 0), 0);
    const count = filtered.length;
    const averagePrice = count > 0 ? totalAmount / count : 0;

    setSummary({
      totalAmount,
      count,
      averagePrice,
    });
  }, [expenses, startDate, endDate]);

  // Group by selected param and sum prices
  const generateSummary = (param) => {
    const summary = {};
    expenses.forEach(exp => {
      if (!isWithinRange(exp.date, startDate, endDate)) return;

      const key = exp[param] || (param === 'category' ? 'Uncategorized' : 'Unnamed');
      summary[key] = (summary[key] || 0) + (exp.price || 0);
    });

    return Object.entries(summary).map(([name, amount]) => ({
      name,
      amount: Number(amount.toFixed(2)),
    }));
  };

  const chartData = generateSummary(selectedParam);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">💰 Expense Analysis</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-6 mb-6 items-center justify-center">
        <div className="min-w-[250px] w-full">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring focus:ring-blue-200"
          />
        </div>

        <div className="min-w-[250px] w-full">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring focus:ring-blue-200"
          />
        </div>

        <div className="min-w-[250px] w-full">
          <label htmlFor="paramSelect" className="block text-sm font-medium text-gray-700">Group By</label>
          <select
            id="paramSelect"
            value={selectedParam}
            onChange={e => setSelectedParam(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring focus:ring-blue-200"
          >
            {parameters.map(param => (
              <option key={param} value={param}>{paramLabels[param]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid md:grid-cols-3 gap-4 text-center mb-10">
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-md text-gray-600 font-medium mb-1">🧾 Total Expenses</h4>
          <p className="text-2xl font-bold text-gray-800">{summary.count}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-md text-gray-600 font-medium mb-1">💵 Total Amount</h4>
          <p className="text-2xl font-bold text-gray-800">₹{summary.totalAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-md text-gray-600 font-medium mb-1">📊 Average Price</h4>
          <p className="text-2xl font-bold text-gray-800">₹{summary.averagePrice.toFixed(2)}</p>
        </div>
      </div>

      {/* Loading/Error/No Data */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
          <span className="ml-3 text-blue-600 text-lg">Loading expenses...</span>
        </div>
      )}
      {error && (
        <div className="text-red-600 text-center my-4 font-medium">{error}</div>
      )}
      {!loading && !error && expenses.length === 0 && (
        <div className="text-center text-gray-500">No expenses found.</div>
      )}
      {!loading && !error && chartData.length === 0 && (
        <div className="text-center text-gray-500">No data available for {paramLabels[selectedParam]}.</div>
      )}

      {/* Charts */}
      {!loading && !error && chartData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-10 mt-8">
          <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center w-full md:col-span-2">
            <h3 className="text-xl font-semibold mb-4 text-center">Animated Bars</h3>
            <TaskAnalysisAnimatedBars data={chartData.map(d => ({ name: d.name, minutes: d.amount }))} />
          </div>

          <div className="bg-white shadow rounded-lg p-6 overflow-x-auto flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4 text-center">Bar Chart</h3>
            <BarChart width={500} height={300} data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" />
              <YAxis />
              <Tooltip formatter={value => `₹${value.toFixed(2)}`} />
              <Legend />
              <Bar
                dataKey="amount"
                fill={COLORS[parameters.indexOf(selectedParam) % COLORS.length]}
              />
            </BarChart>
          </div>

          <div className="bg-white shadow rounded-lg p-6 overflow-x-auto flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4 text-center">Pie Chart</h3>
            <PieChart width={400} height={300}>
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name }) => name}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={value => `₹${value.toFixed(2)}`} />
            </PieChart>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseAnalysis;
