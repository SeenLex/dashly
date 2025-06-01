import React, { useEffect } from 'react';
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
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
          <XAxis dataKey={labelDataKey} stroke="var(--text-color-secondary)" tick={false} />
          <YAxis stroke="var(--text-color-secondary)" />
          <Tooltip labelFormatter={(label) => `${labelName}${label}`} content={<CustomTooltip labelName={tooltipLabelName}/>} />
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