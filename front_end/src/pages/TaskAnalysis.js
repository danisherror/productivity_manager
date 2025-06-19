import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BF6', '#F67280'];

const parameters = [
  'category',
  'tags',
  'mood',
  'isCompleted',
  'taskName',
  'productivityScore'
];

const paramLabels = {
  category: 'Category',
  tags: 'Tags',
  mood: 'Mood',
  isCompleted: 'Completion Status',
  taskName: 'Task Name',
  productivityScore: 'Productivity Score',
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
          case 'mood': key = t.mood || 'Unknown'; break;
          case 'isCompleted': key = t.isCompleted ? 'Completed' : 'Pending'; break;
          case 'taskName': key = t.taskName || 'No Name'; break;
          case 'productivityScore':
            key = t.productivityScore != null ? `Score ${t.productivityScore}` : 'No Score';
            break;
          default: key = 'Unknown';
        }
        summary[key] = (summary[key] || 0) + duration;
      }
    });
    return Object.entries(summary).map(([name, dur]) => ({ name, minutes: Math.round(dur) }));
  };

  const data = generateSummary(selectedParam);

  return (
    <div style={{ maxWidth: 1200, margin: 'auto' }}>
      <h2>Task Analysis by Parameter</h2>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="startDate">Start Date:&nbsp;</label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />
        &nbsp;&nbsp;
        <label htmlFor="endDate">End Date:&nbsp;</label>
        <input
          id="endDate"
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="paramSelect">Select Parameter:&nbsp;</label>
        <select
          id="paramSelect"
          value={selectedParam}
          onChange={e => setSelectedParam(e.target.value)}
        >
          {parameters.map(param => (
            <option key={param} value={param}>
              {paramLabels[param]}
            </option>
          ))}
        </select>
      </div>

      {loading && <div>Loading tasks...</div>}

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div>No tasks found for selected date range.</div>
      )}

      {!loading && !error && filtered.length > 0 && data.length === 0 && (
        <div>No data available for {paramLabels[selectedParam]}.</div>
      )}

      {!loading && !error && data.length > 0 && (
        <div style={{ marginBottom: 50 }}>
          <h3>Analysis by {paramLabels[selectedParam]}</h3>
          <BarChart width={700} height={300} data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="minutes" fill={COLORS[parameters.indexOf(selectedParam) % COLORS.length]} />
          </BarChart>
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
      )}
    </div>
  );
};

export default TaskAnalysis;
