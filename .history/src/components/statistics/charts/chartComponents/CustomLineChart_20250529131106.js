import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { format, parseISO } from "date-fns";

const CustomLineChart = ({
  title,
  data,
  labelName = "",
  dataKey,
  secondDataKey,
  secondStroke,
  secondLabel,
}) => {
  const primaryColor = "#4299e1"; // Accent blue
  const secondaryColor = secondStroke || "#f56565"; // Accent red

  return (
    <div>
      <p className="text-lg font-semibold text-white mb-4 text-center">
        {title}
      </p>
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
          <XAxis
  dataKey="label"
  stroke="var(--text-color-secondary)"
  tickFormatter={(str) => {
    try {
      const parsed = parseISO(str);
      if (str.length === 13) {
        // Formatul "2025-05-29 09" – păstrăm ora
        return str.slice(11) + ":00";
      } else if (str.length === 10) {
        // Formatul "2025-05-29"
        return format(parsed, "dd MMM");
      } else if (str.length === 7) {
        // Formatul "2025-05"
        return format(parsed, "MMM yyyy");
      }
      return str;
    } catch {
      return str;
    }
  }}
/>


          <YAxis
            stroke="var(--text-color-secondary)"
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip
            labelFormatter={(label) => `${labelName}${label}`}
            contentStyle={{
              backgroundColor: "var(--secondary-bg)",
              border: "1px solid var(--card-border)",
              color: "var(--text-color-primary)",
            }}
            itemStyle={{ color: "var(--text-color-primary)" }}
          />
          <Legend wrapperStyle={{ color: "var(--text-color-primary)" }} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={primaryColor}
            fill={primaryColor}
            fillOpacity={0.3}
            name={dataKey}
          />
          {secondDataKey && secondLabel && (
            <Area
              type="monotone"
              dataKey={secondDataKey}
              stroke={secondaryColor}
              fill={secondaryColor}
              fillOpacity={0.3}
              name={secondLabel}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomLineChart;
