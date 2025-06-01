import { useState } from "react"
import { Legend, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import CustomTooltip from "../../customComponents/CustomToolTip";

function CustomPieChart({ title, data, nameKey, dataKey }) {
  const COLORS = ["#4299e1", "#48bb78", "#ed8936", "#f56565", "#667eea", "#ECC94B", "#9F7AEA", "#4FD1C5"];
  const [tooltipState, setTooltipState] = useState(false);

  return (
    <div>
      <p className="text-lg font-semibold text-black dark:text-white mb-4 text-center">{title}</p>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart onClick={(e) => {
          setTooltipState(
            !tooltipState
          );
        }}>
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          <Tooltip
            trigger="click"
            active={tooltipState}
            content={
              <CustomTooltip
                displayLabel={title + ": "}
                buttonCallback={() => { setTooltipState(false); }}
              />}
          />
          <Pie
            data={data.filter(e => e[dataKey] > 0)}
            cx="50%"
            cy="50%"
            //labelLine={false}
            outerRadius={130}
            dataKey={dataKey}
            nameKey={nameKey}
            label={({ value }) => (value === 0 ? "" : value)}
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
