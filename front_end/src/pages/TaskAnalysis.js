import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell,
} from 'recharts';

import TaskAnalysisAnimatedBars from './TaskAnalysisAnimatedBars';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BF6', '#F67280'];

const parameters = ['category', 'taskName'];

const paramLabels = {
  category: 'Category',
  taskName: 'Task Name',
};

const TaskAnalysis = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedParam, setSelectedParam] = useState(parameters[0]);

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_BACKEND_URL}/user_schedule_getAll`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch task data.');
        setLoading(false);
      });
  }, []);

  const getDuration = (s, e) => (new Date(e) - new Date(s)) / (1000 * 60);

  const isWithinRange = (date, from, to) => {
    const d = new Date(date);
    const fromDate = from ? new Date(from) : null;
    let toDate = to ? new Date(to) : null;

    if (fromDate && toDate && fromDate.toDateString() === toDate.toDateString()) {
      toDate.setHours(23, 59, 59, 999);
    }

    return (!fromDate || d >= fromDate) && (!toDate || d <= toDate);
  };

  const filtered = tasks.filter(t => isWithinRange(t.startTime, startDate, endDate));

  const generateSummary = (param) => {
    const summary = {};
    filtered.forEach(t => {
      const duration = getDuration(t.startTime, t.endTime);
      if (param === 'tags') {
        (t.tags || ['No Tag']).forEach(tag => {
          const trimmed = tag || 'Untagged';
          summary[trimmed] = (summary[trimmed] || 0) + duration;
        });
      } else {
        let key;
        switch (param) {
          case 'category': key = t.category || 'Uncategorized'; break;
          case 'taskName': key = t.taskName || 'No Name'; break;
          default: key = 'Unknown';
        }
        summary[key] = (summary[key] || 0) + duration;
      }
    });
    return Object.entries(summary).map(([name, dur]) => ({ name, minutes: Math.round(dur) }));
  };

  const data = generateSummary(selectedParam);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">📊 Task Analysis</h2>

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
          <label htmlFor="paramSelect" className="block text-sm font-medium text-gray-700">Parameter</label>
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

      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
          <span className="ml-3 text-blue-600 text-lg">Loading tasks...</span>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-center my-4 font-medium">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center text-gray-500">No tasks found for selected date range.</div>
      )}

      {!loading && !error && filtered.length > 0 && data.length === 0 && (
        <div className="text-center text-gray-500">No data available for {paramLabels[selectedParam]}.</div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="grid md:grid-cols-2 gap-10 mt-8">
          <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center w-full md:col-span-2">
            <h3 className="text-xl font-semibold mb-4 text-center">Animated Bars</h3>
            <TaskAnalysisAnimatedBars data={data} />
          </div>
          <div className="bg-white shadow rounded-lg p-6 overflow-x-auto flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4 text-center">Bar Chart</h3>
            <BarChart width={500} height={300} data={data}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="minutes"
                fill={COLORS[parameters.indexOf(selectedParam) % COLORS.length]}
              />
            </BarChart>
          </div>

          <div className="bg-white shadow rounded-lg p-6 overflow-x-auto flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4 text-center">Pie Chart</h3>
            <PieChart width={400} height={300}>
              <Pie
                data={data}
                dataKey="minutes"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>

        </div>

      )}
    </div>
  );
};

export default TaskAnalysis;
