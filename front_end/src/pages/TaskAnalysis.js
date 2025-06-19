import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';

export default function TaskAnalysis() {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/user_schedule_getAll', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => setError('Failed to fetch task data.'));
  }, []);

  const getDuration = (start, end) => {
    return (new Date(end) - new Date(start)) / (1000 * 60); // minutes
  };

  // ========== All-Time Category Breakdown ==========
  const categorySummary = {};
  tasks.forEach(task => {
    const duration = getDuration(task.startTime, task.endTime);
    if (categorySummary[task.category]) {
      categorySummary[task.category] += duration;
    } else {
      categorySummary[task.category] = duration;
    }
  });
  const totalChartData = Object.entries(categorySummary).map(([name, minutes]) => ({
    name,
    minutes: Math.round(minutes)
  }));

  // ========== Daily Category Breakdown ==========
  const filteredTasks = selectedDate
    ? tasks.filter(task =>
        new Date(task.startTime).toISOString().slice(0, 10) === selectedDate
      )
    : [];

  const dailyCategorySummary = {};
  filteredTasks.forEach(task => {
    const duration = getDuration(task.startTime, task.endTime);
    if (dailyCategorySummary[task.category]) {
      dailyCategorySummary[task.category] += duration;
    } else {
      dailyCategorySummary[task.category] = duration;
    }
  });

  const dailyChartData = Object.entries(dailyCategorySummary).map(([name, minutes]) => ({
    name,
    minutes: Math.round(minutes)
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BF6', '#F67280'];

  return (
    <div style={{ maxWidth: 900, margin: 'auto' }}>
      <h2>Task Time Analysis</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* All Time Analysis */}
      <h3>All-Time Analysis (Time Spent by Category)</h3>
      {totalChartData.length === 0 ? <p>No data available.</p> : (
        <>
          <BarChart width={700} height={300} data={totalChartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="minutes" fill="#8884d8" />
          </BarChart>

          <PieChart width={400} height={300}>
            <Pie data={totalChartData} dataKey="minutes" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {totalChartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </>
      )}

      <hr />

      {/* Daily Analysis */}
      <h3>Daily Analysis</h3>
      <label>Select a Date: </label>
      <input
        type="date"
        value={selectedDate}
        onChange={e => setSelectedDate(e.target.value)}
        style={{ marginBottom: '20px' }}
      />

      {selectedDate && dailyChartData.length === 0 && <p>No tasks found on {selectedDate}.</p>}

      {selectedDate && dailyChartData.length > 0 && (
        <>
          <BarChart width={700} height={300} data={dailyChartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="minutes" fill="#82ca9d" />
          </BarChart>

          <PieChart width={400} height={300}>
            <Pie data={dailyChartData} dataKey="minutes" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {dailyChartData.map((entry, index) => (
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
