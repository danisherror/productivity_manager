import React, { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { addDays, subDays } from 'date-fns';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

export default function ProductivityHeatmap() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user_daily_Productivity_getAll`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await res.json();

                if (res.ok) {
                    const formattedData = data.map(task => ({
                        ...task,
                        date: new Date(task.date).toISOString().slice(0, 10),
                    }));
                    setTasks(formattedData);
                } else {
                    setError('Failed to fetch daily productivity');
                }
            } catch (err) {
                setError('Server error');
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const today = new Date();
    const startDate = subDays(today, 180); // last 6 months

    const heatmapData = tasks.map(task => ({
        date: task.date,
        count: task.productivityScore || 0,
    }));

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-center mb-6">🔥 Productivity Heatmap</h2>

            {loading ? (
                <div className="text-center text-blue-600">Loading...</div>
            ) : error ? (
                <div className="text-center text-red-600">{error}</div>
            ) : (
                <>
                    <CalendarHeatmap
                        startDate={startDate}
                        endDate={today}
                        values={heatmapData}
                        classForValue={value => {
                            if (!value) return 'fill-gray-200';
                            if (value.count === 0) return 'fill-red-600';
                            if (value.count <= 2) return 'fill-green-200';
                            if (value.count <= 5) return 'fill-green-400';
                            if (value.count <= 8) return 'fill-green-600';
                            return 'fill-green-800';
                        }}
                        tooltipDataAttrs={value => {
                            if (!value || !value.date) return null;
                            const productivity = value.count ?? 'No productivity data';
                            return {
                                'data-tooltip-id': 'heatmap-tooltip',
                                'data-tooltip-content': `${value.date}: Productivity ${productivity}`,
                            };
                        }}
                        showWeekdayLabels
                    />

                    <Tooltip id="heatmap-tooltip" />
                </>
            )}

            <div className="flex justify-center gap-4 mt-6 text-sm">
                <div className="w-5 h-5 rounded bg-red-600" title="0" /> 0
                <div className="w-5 h-5 rounded bg-gray-200" title="None" /> None
                <div className="w-5 h-5 rounded bg-green-200" title="1–2" /> 1–2
                <div className="w-5 h-5 rounded bg-green-400" title="3–5" /> 3–5
                <div className="w-5 h-5 rounded bg-green-600" title="6–8" /> 6–8
                <div className="w-5 h-5 rounded bg-green-800" title="9+" /> 9+
            </div>
        </div>
    );
}
