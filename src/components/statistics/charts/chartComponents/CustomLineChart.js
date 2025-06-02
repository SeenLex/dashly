import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import CustomTooltip from '../../customComponents/CustomToolTip';

const CustomLineChart = ({
  title,
  data,
  labelName = "",
  dataKey,
  labelDataKey,
  secondDataKey,
  secondStroke,
  secondLabel,
  tooltipLabelName = ""
}) => {
  const primaryColor = "#4299e1"; // Accent blue
  const secondaryColor = secondStroke || "#f56565"; // Accent red
  const [tooltipState, setTooltipState] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 p-10">
        <p className="text-lg font-semibold">{title}</p>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-lg font-semibold text-black dark:text-white mb-4 text-center">{title}</p>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          onClick={() => setTooltipState(!tooltipState)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
          <XAxis dataKey={labelDataKey} stroke="var(--text-color-secondary)" tick={false} />
          <YAxis stroke="var(--text-color-secondary)" />
          <Tooltip 
            trigger="click"
            active={tooltipState} 
            labelFormatter={(label) => `${labelName}${label}`} 
            content={<CustomTooltip buttonCallback={() => setTooltipState(false)} labelName={tooltipLabelName} />} 
          />
          <Legend wrapperStyle={{ color: 'black' }} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={primaryColor}
            fill={primaryColor}
            fillOpacity={0.3}
            name={labelName}
          />
          {secondDataKey && secondLabel && (
            <Area
              type="monotone"
              dataKey={secondDataKey}
              stroke={secondaryColor}
              fill={secondaryColor}
              fillOpacity={0.2}
              name={secondLabel}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};


export default CustomLineChart;