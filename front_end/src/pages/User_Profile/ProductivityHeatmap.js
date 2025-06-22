import React, { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { addDays, subDays, format, differenceInDays, addMonths } from 'date-fns';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const PERIOD_LENGTH_MONTHS = 6;

export default function ProductivityHeatmap() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Compute periods: last 2 years divided into 6-month chunks
    const today = new Date();
    const periods = [];
    // Start 2 years ago exactly at beginning of month
    let periodStart = new Date(today.getFullYear() - 2, today.getMonth() < 6 ? 6 : 0, 1);

    // Create 4 periods: 6 months each (2 years = 4 half-year periods)
    for (let i = 0; i < 4; i++) {
        const periodEnd = addMonths(periodStart, PERIOD_LENGTH_MONTHS);
        periods.push({
            start: periodStart,
            end: subDays(periodEnd, 1), // subtract 1 day to get inclusive end date
            label: `${format(periodStart, 'MMM yyyy')} - ${format(subDays(periodEnd, 1), 'MMM yyyy')}`
        });
        periodStart = periodEnd;
    }

    // Selected period index state
    const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(periods.length - 1); // default last 6 months

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

    // Get current selected period start/end
    const { start, end } = periods[selectedPeriodIndex];

    // Create a map of date -> productivity for fast lookup
    const taskMap = {};
    tasks.forEach(task => {
        taskMap[task.date] = task.productivityScore ?? 0;
    });

    // Generate values for each day in the selected period
    const totalDays = differenceInDays(end, start) + 1;
    const heatmapData = Array.from({ length: totalDays }).map((_, i) => {
        const date = format(addDays(start, i), 'yyyy-MM-dd');
        return {
            date,
            count: taskMap[date] ?? null,
        };
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
            {/* Sidebar with buttons */}
            <aside className="md:w-40 mb-6 md:mb-0 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Select Period</h3>
                <div className="flex flex-col space-y-3">
                    {periods.map((period, index) => (
                        <button
                            key={period.label}
                            onClick={() => setSelectedPeriodIndex(index)}
                            className={`px-2 py-1 text-sm rounded-md text-left truncate max-w-[140px] transition ${index === selectedPeriodIndex
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 hover:bg-blue-500 hover:text-white'
                                }`}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>
            </aside>

            {/* Heatmap and legend */}
            <main className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-center mb-6">🔥 Productivity Heatmap</h2>

                {loading ? (
                    <div className="text-center text-blue-600">Loading...</div>
                ) : error ? (
                    <div className="text-center text-red-600">{error}</div>
                ) : (
                    <>
                        <CalendarHeatmap
                            startDate={start}
                            endDate={end}
                            values={heatmapData}
                            classForValue={value => {
                                if (!value) return 'fill-gray-200';
                                if (value.count === null) return 'fill-gray-200';
                                if (value.count === 0) return 'fill-red-600';
                                if (value.count <= 2) return 'fill-green-200';
                                if (value.count <= 5) return 'fill-green-400';
                                if (value.count <= 8) return 'fill-green-600';
                                return 'fill-green-800';
                            }}
                            tooltipDataAttrs={value => {
                                if (!value || !value.date) return null;
                                const productivity = value.count === null ? 'No productivity data' : value.count;
                                return {
                                    'data-tooltip-id': 'heatmap-tooltip',
                                    'data-tooltip-content': `${value.date}: Productivity ${productivity}`,
                                };
                            }}
                            showWeekdayLabels
                        />
                        <Tooltip id="heatmap-tooltip" />

                        <div className="flex justify-center gap-4 mt-6 text-sm">
                            <div className="w-5 h-5 rounded bg-red-600" title="0" /> 0
                            <div className="w-5 h-5 rounded bg-gray-200" title="No Data" /> No Data
                            <div className="w-5 h-5 rounded bg-green-200" title="1–2" /> 1–2
                            <div className="w-5 h-5 rounded bg-green-400" title="3–5" /> 3–5
                            <div className="w-5 h-5 rounded bg-green-600" title="6–8" /> 6–8
                            <div className="w-5 h-5 rounded bg-green-800" title="9+" /> 9+
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
