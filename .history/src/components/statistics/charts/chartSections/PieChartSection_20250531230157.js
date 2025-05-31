import React from "react";
import { Legend, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export const SimpleCustomTooltip = ({ active, payload, dataKey, nameKey }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
        <p className="label font-semibold text-gray-800 dark:text-gray-200">
          {payload[0].payload[nameKey]}
        </p>
        <p className="value text-blue-600 dark:text-blue-400">
          {payload[0].payload[dataKey]} tickets
        </p>
        {payload[0].payload.percentage && (
          <p className="percent text-green-600 dark:text-green-400">
            {payload[0].payload.percentage}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

function CustomPieChart({ title, data, nameKey, dataKey, onSliceClick }) {
  const COLORS = ["#4299e1", "#48bb78", "#ed8936", "#f56565", "#667eea", "#ECC94B", "#9F7AEA", "#4FD1C5"];

  return (
    <div>
      <p className="text-lg font-semibold text-black dark:text-white mb-4 text-center">{title}</p>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          <Tooltip content={(props) => <SimpleCustomTooltip {...props} dataKey={dataKey} nameKey={nameKey} />} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={130}
            dataKey={dataKey}
            nameKey={nameKey}
            onClick={onSliceClick}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CustomPieChart;
