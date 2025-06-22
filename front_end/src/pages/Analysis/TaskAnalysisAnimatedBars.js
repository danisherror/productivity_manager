import React from "react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BF6", "#F67280"];

const TaskAnalysisAnimatedBars = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <div className="flex flex-wrap gap-6 justify-center max-w-full mx-auto">
      {data
        .sort((a, b) => b.minutes - a.minutes)
        .map((item, i) => {
          const percentage = total ? ((item.minutes / total) * 100).toFixed(1) : 0;
          const barColor = COLORS[i % COLORS.length];

          return (
            <div
              key={i}
              className="flex flex-col items-center flex-shrink-0 w-36"
              style={{ minWidth: '150px' }}
            >
              {/* Label on top */}
              <div className="text-sm font-medium text-gray-700 mb-2 text-center truncate w-full">
                {item.name}
              </div>

              {/* Bar container */}
              <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden relative">
                {/* Animated colored bar with centered percentage */}
                <div
                  className="h-6 rounded-full text-white flex items-center justify-center text-xs font-semibold transition-all duration-700 ease-in-out"
                  style={{
                    // width: `${percentage}%`,
                    backgroundColor: barColor,
                  }}
                >
                  {percentage}%
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default TaskAnalysisAnimatedBars;
