import { Legend, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

function CustomPieChart({ title, data, nameKey, onSliceClick }) {
  const RADIAN = Math.PI / 180;
  const COLORS = [
    "#4299e1", // Blue
    "#48bb78", // Green
    "#ed8936", // Orange
    "#f56565", // Red
    "#667eea", // Indigo
    "#ECC94B", // Yellow
    "#9F7AEA", // Purple
    "#4FD1C5", // Teal
  ];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Tooltip simplu
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, count } = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: '#fff',
            padding: '5px 10px',
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          <div><strong>{name}</strong></div>
          <div>{count} tickets</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <p className="text-lg font-semibold text-black dark:text-white mb-4 text-center">{title}</p>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ color: 'var(--text-color-primary)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={130}
            dataKey="count"
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
