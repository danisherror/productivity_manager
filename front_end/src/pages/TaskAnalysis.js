import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell
} from 'recharts';

export default function TaskAnalysis() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/user_schedule_getAll', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(() => setError('Failed to fetch task data.'));
  }, []);

  const getDuration = (start, end) =>
    (new Date(end) - new Date(start)) / (1000 * 60); // minutes

  const isWithinRange = (date, from, to) => {
    const d = new Date(date);
    return (!from || d >= new Date(from)) && (!to || d <= new Date(to));
  };

  const filteredTasks = tasks.filter(task =>
    isWithinRange(task.startTime, startDate, endDate)
  );

  const summarizeData = (taskList) => {
    const map = {};
    taskList.forEach(task => {
      const duration = getDuration(task.startTime, task.endTime);
      if (map[task.category]) map[task.category] += duration;
      else map[task.category] = duration;
    });
    return Object.entries(map).map(([name, minutes]) => ({
      name,
      minutes: Math.round(minutes)
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BF6', '#F67280'];
  const chartData = summarizeData(filteredTasks);

  return (
    <div style={{ maxWidth: 900, margin: 'auto' }}>
      <h2>Task Analysis</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Filter Section */}
      <div style={{ marginBottom: 20 }}>
        <label>Start Date: </label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <span style={{ margin: '0 10px' }}></span>
        <label>End Date: </label>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </div>

      {/* Charts */}
      {chartData.length === 0 ? (
        <p>No task data found in selected date range.</p>
      ) : (
        <>
          <BarChart width={700} height={300} data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="minutes" fill="#8884d8" />
          </BarChart>

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
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </>
      )}
    </div>
  );
}
