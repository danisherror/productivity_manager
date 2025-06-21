import React, { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { addDays, subDays, format, differenceInDays, addMonths } from 'date-fns';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const PERIOD_LENGTH_MONTHS = 6;

export default function DailyLoginHeatmap() {
  const [loginDates, setLoginDates] = useState([]); // Array of 'yyyy-MM-dd'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date();
  const periods = [];
  let periodStart = new Date(today.getFullYear() - 2, today.getMonth() < 6 ? 6 : 0, 1);
  for (let i = 0; i < 4; i++) {
    const periodEnd = addMonths(periodStart, PERIOD_LENGTH_MONTHS);
    periods.push({
      start: periodStart,
      end: subDays(periodEnd, 1),
      label: `${format(periodStart, 'MMM yyyy')} - ${format(subDays(periodEnd, 1), 'MMM yyyy')}`,
    });
    periodStart = periodEnd;
  }

  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(periods.length - 1);

  useEffect(() => {
    const fetchLoginDates = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/userRecord`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        console.log(data);
        if (res.ok && Array.isArray(data.dates)) {
          const formattedDates = data.dates.map(d => new Date(d).toISOString().slice(0, 10));
          setLoginDates(formattedDates);
        } else {
          setError('Failed to fetch login data');
        }
      } catch (err) {
        setError('Server error');
      } finally {
        setLoading(false);
      }
    };

    fetchLoginDates();
  }, []);

  const { start, end } = periods[selectedPeriodIndex];

  // Convert list of login dates to a Set for quick lookup
  const loginSet = new Set(loginDates);

  const totalDays = differenceInDays(end, start) + 1;
  const heatmapData = Array.from({ length: totalDays }).map((_, i) => {
    const date = format(addDays(start, i), 'yyyy-MM-dd');
    return {
      date,
      count: loginSet.has(date) ? 1 : 0,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
      <aside className="md:w-40 mb-6 md:mb-0 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Select Period</h3>
        <div className="flex flex-col space-y-3">
          {periods.map((period, index) => (
            <button
              key={period.label}
              onClick={() => setSelectedPeriodIndex(index)}
              className={`px-2 py-1 text-sm rounded-md text-left truncate max-w-[140px] transition ${
                index === selectedPeriodIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-blue-500 hover:text-white'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold text-center mb-6">🔥 Daily Login Heatmap</h2>

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
                if (!value || value.count === 0) return 'fill-gray-200';
                return 'fill-green-800';
              }}
              tooltipDataAttrs={value => {
                if (!value || !value.date) return null;
                return {
                  'data-tooltip-id': 'heatmap-tooltip',
                  'data-tooltip-content': value.count === 1
                    ? `${value.date}: Logged In`
                    : `${value.date}: No Login`,
                };
              }}
              showWeekdayLabels
            />
            <Tooltip id="heatmap-tooltip" />

            <div className="flex justify-center gap-4 mt-6 text-sm">
              <div className="w-5 h-5 rounded bg-gray-200" title="No login" /> No login
              <div className="w-5 h-5 rounded bg-green-800" title="Login" /> Login
            </div>
          </>
        )}
      </main>
    </div>
  );
}
