import {
  YAxis,
  XAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { useState } from "react";
import CustomTooltip from "../../customComponents/CustomToolTip";

function CustomBarChart({
  title,
  data,
  dataKey,
  categoryKey = "priority",
  stacked = false,
  colors = [],
  showBothValues = false,
  totalCount,
  teamsByCategory = {},
  slaStatusByTeam = [],
  slaStatusByProject = [],
}) {
  const isEmpty = !data || data.length === 0;
  const defaultColors = ["#4299e1", "#48bb78", "#ed8936", "#f56565"];
  const fallbackData = [
    {
      [categoryKey]: "No Data",
      ...(Array.isArray(dataKey)
        ? dataKey.reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
        : { [dataKey]: 0 }),
    },
  ];
  const [tooltipState, setTooltipState] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <p className="text-lg font-semibold text-black dark:text-white mb-4 text-center">
        {title}
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={isEmpty ? fallbackData : data}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          onClick={(e) => {
            setTooltipState(
              !tooltipState
            );
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
          <XAxis
            dataKey={categoryKey}
            angle={-45}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 12, fill: "var(--text-color-secondary)" }}
            stroke="var(--text-color-secondary)"
          />
          <YAxis stroke="var(--text-color-secondary)" />

          <Tooltip
            trigger="click"
            active={tooltipState}
            content={
              <CustomTooltip
                displayLabel={title + ": "}
                teamsByCategory={teamsByCategory}
                slaStatusByTeam={slaStatusByTeam}
                slaStatusByProject={slaStatusByProject}
                buttonCallback={() => { setTooltipState(false); }}
              />}
          />

          <Legend wrapperStyle={{ color: "var(--text-color-primary)" }} />

          {Array.isArray(dataKey) ? (
            // Afișare pentru graficele stacked (SLA Compliance)
            dataKey.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={
                  key === "Met"
                    ? "#4CAF50"
                    : key === "In Progress"
                      ? "#FF9800"
                      : "#F44336" // Exceeded
                }
              >
                <LabelList
                  dataKey={key}
                  position="top"
                  formatter={(value) => `${value}`}
                  style={{ fill: "#333", fontSize: 12, fontWeight: "bold" }}
                />
              </Bar>
            ))
          ) : (
            // Afișare pentru graficele simple (count/percentage)
            <Bar dataKey={dataKey} fill={colors[0] || defaultColors[0]}>
              {showBothValues && (
                <LabelList
                  dataKey={dataKey}
                  position="top"
                  formatter={(value) => {
                    const total =
                      totalCount ||
                      data.reduce((sum, item) => sum + (item[dataKey] || 0), 0);
                    const percentage = total
                      ? Math.round((value / total) * 100)
                      : 0;
                    return `${value} (${percentage}%)`;
                  }}
                  style={{
                    fill: "#333",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                />
              )}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export default CustomBarChart;
