import { Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

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
  payload,
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
      {payload.count} {/* aici afișezi numărul */}
    </text>
  );
};



  return (
    <div>
      <p className="text-lg font-semibold text-white mb-4 text-center">{title}</p>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ color: 'var(--text-color-primary)' }} />
   <Pie
  data={data}
  cx="50%"
  cy="50%"
  labelLine={false}
  label={renderCustomizedLabel}
  outerRadius={130}
  dataKey="count"
  nameKey={nameKey}
  onClick={(entry, index) => {
    if (onSliceClick) {
      onSliceClick(entry[nameKey]); // trimite "Closed" sau "Critical" etc.
    }
  }}
>
  {data.map((entry, index) => (
    <Cell key={index} fill={COLORS[index % COLORS.length]} />
  ))}
</Pie>


          
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CustomPieChart;