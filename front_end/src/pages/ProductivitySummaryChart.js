import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell } from 'recharts';

const ProductivitySummaryChart = () => {
  const [summary, setSummary] = useState({ totalScore: 0, numberOfDays: 0, percentage: 0 });

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/user_daily_Productivity_getSummary`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(err => console.error(err));
  }, []);

  const chartData = [
    { name: 'Productive', value: summary.percentage },
    { name: 'Remaining', value: 100 - summary.percentage },
  ];

  const COLORS = ['#00C49F', '#f3f4f6']; // Green and light gray

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto text-center">
      <h2 className="text-xl font-semibold mb-4">Productivity Summary</h2>
      <PieChart width={250} height={250}>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
      <div className="text-2xl font-bold text-green-600 mt-[-130px]">{summary.percentage}%</div>
      <p className="mt-20 text-gray-600">
        {summary.totalScore} points over {summary.numberOfDays} day(s)
      </p>
    </div>
  );
};

export default ProductivitySummaryChart;
