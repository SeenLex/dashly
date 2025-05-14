import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

// pick a distinct color per status
const COLORS = {
  Open: "#3182ce",
  "In Progress": "#dd6b20",
  Pending: "#d69e2e",
  Closed: "#38a169",
  Resolved: "#805ad5",
};

export default function TicketStatusPieChart({ data = [], height = 420 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          outerRadius={120} // <-- mai mare decât 80
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry) => (
            <Cell
              key={entry.status}
              fill={COLORS[entry.status] || "#718096"}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [value, name]} />
        <Legend layout="horizontal" verticalAlign="bottom" align="center" /> {/* <-- adăugat */}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
