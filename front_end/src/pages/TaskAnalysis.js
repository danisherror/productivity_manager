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

const TaskAnalysis = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/user_schedule_getAll', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(() => setError('Failed to fetch task data.'));
  }, []);

  const getDuration = (s, e) => (new Date(e) - new Date(s)) / (1000 * 60);

  const isWithinRange = (date, from, to) => {
    const d = new Date(date);
    return (!from || d >= new Date(from)) && (!to || d <= new Date(to));
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

  return (
    <div style={{ maxWidth: 1200, margin: 'auto' }}>
      <h2>Task Analysis by Parameter</h2>

      <div style={{ marginBottom: '20px' }}>
        <label>Start Date:&nbsp;
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </label>
        &nbsp;&nbsp;
        <label>End Date:&nbsp;
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </label>
      </div>
      {parameters.map((param, idx) => {
        const data = generateSummary(param);
        return data.length > 0 && (
          <div key={param} style={{ marginBottom: 50 }}>
            <h3>Analysis by {param}</h3>
            <BarChart width={700} height={300} data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="minutes" fill={COLORS[idx % COLORS.length]} />
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
        );
      })}
    </div>
  );
};

export default TaskAnalysis;