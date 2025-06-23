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
  const [productivity, setProductivity] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedParam, setSelectedParam] = useState(parameters[0]);
  const [summary, setSummary] = useState({
    totalScore: 0,
    numberOfDays: 0,
    percentage: 0,
    totalMinutes: 0,
  });

  const getDuration = (s, e) => (new Date(e) - new Date(s)) / (1000 * 60);

  const isWithinRange = (date, from, to) => {
    const d = new Date(date);

    const dUTC = new Date(Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds(),
      d.getUTCMilliseconds()
    ));

    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    let fromUTC = fromDate ? new Date(Date.UTC(
      fromDate.getUTCFullYear(),
      fromDate.getUTCMonth(),
      fromDate.getUTCDate()
    )) : null;

    let toUTC = toDate ? new Date(Date.UTC(
      toDate.getUTCFullYear(),
      toDate.getUTCMonth(),
      toDate.getUTCDate()
    )) : null;

    // If same date, set toUTC to end of the day
    if (fromUTC && toUTC && fromUTC.getTime() === toUTC.getTime()) {
      toUTC.setUTCHours(23, 59, 59, 999);
    }

    return (!fromUTC || dUTC >= fromUTC) && (!toUTC || dUTC <= toUTC);
  };


  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${process.env.REACT_APP_BACKEND_URL}/user_schedule_getAll`, { credentials: 'include' }).then(res => res.json()),
      fetch(`${process.env.REACT_APP_BACKEND_URL}/user_daily_Productivity_getAll`, { credentials: 'include' }).then(res => res.json())
    ])
      .then(([taskData, prodData]) => {
        setTasks(taskData);
        setProductivity(prodData);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch data.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const filtered = productivity.filter(p => isWithinRange(p.date, startDate, endDate));
    const totalScore = filtered.reduce((acc, rec) => acc + rec.productivityScore, 0);
    const numberOfDays = filtered.length;
    const percentage = numberOfDays > 0 ? (totalScore / (numberOfDays * 10)) * 100 : 0;

    const totalMinutes = tasks
      .filter(t =>
        isWithinRange(t.startTime, startDate, endDate) ||
        isWithinRange(t.endTime, startDate, endDate)
      )
      .reduce((acc, t) => acc + getDuration(t.startTime, t.endTime), 0);

    setSummary({
      totalScore,
      numberOfDays,
      percentage: Number(percentage.toFixed(2)),
      totalMinutes: Math.round(totalMinutes),
    });
  }, [productivity, tasks, startDate, endDate]);

  const filteredTasks = tasks.filter(t => isWithinRange(t.startTime, startDate, endDate));

  const generateSummary = (param) => {
    const summary = {};
    filteredTasks.forEach(t => {
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

  const chartData = generateSummary(selectedParam);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">📊 Task Analysis</h2>

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

      {/* Summary cards */}
      <div className="grid md:grid-cols-4 gap-4 text-center mb-10">
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-md text-gray-600 font-medium mb-1">📅 Total Days</h4>
          <p className="text-2xl font-bold text-gray-800">{summary.numberOfDays}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-md text-gray-600 font-medium mb-1">📈 Total Score</h4>
          <p className="text-2xl font-bold text-gray-800">{summary.totalScore}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-md text-gray-600 font-medium mb-1">🔥 Score %</h4>
          <p className="text-2xl font-bold text-gray-800">{summary.percentage}%</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-md text-gray-600 font-medium mb-1">⏱ Total Time Logged</h4>
          <p className="text-2xl font-bold text-gray-800">
            {Math.floor(summary.totalMinutes / 60)}h {summary.totalMinutes % 60}m
          </p>
        </div>
      </div>

      {/* Loading/Error/No Data */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
          <span className="ml-3 text-blue-600 text-lg">Loading tasks...</span>
        </div>
      )}
      {error && (
        <div className="text-red-600 text-center my-4 font-medium">{error}</div>
      )}
      {!loading && !error && filteredTasks.length === 0 && (
        <div className="text-center text-gray-500">No tasks found for selected date range.</div>
      )}
      {!loading && !error && filteredTasks.length > 0 && chartData.length === 0 && (
        <div className="text-center text-gray-500">No data available for {paramLabels[selectedParam]}.</div>
      )}

      {/* Charts */}
      {!loading && !error && chartData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-10 mt-8">
          <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center w-full md:col-span-2">
            <h3 className="text-xl font-semibold mb-4 text-center">Animated Bars</h3>
            <TaskAnalysisAnimatedBars data={chartData} />
          </div>

          <div className="bg-white shadow rounded-lg p-6 overflow-x-auto flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4 text-center">Bar Chart</h3>
            <BarChart width={500} height={300} data={chartData}>
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
                data={chartData}
                dataKey="minutes"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {chartData.map((entry, i) => (
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
