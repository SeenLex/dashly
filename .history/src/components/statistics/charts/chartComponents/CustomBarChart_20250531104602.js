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

function CustomTooltip({ active, payload }) {
  if (!(active && payload && payload.length)) return null;

  // Preluăm tickets din payload (dacă există)
  const tickets = payload[0].payload.tickets || [];

  return (
    <div style={{ backgroundColor: "white", padding: 10, border: "1px solid #ccc" }}>
      <p><strong>{payload[0].payload.team || payload[0].payload.name || payload[0].payload.priority || "N/A"}</strong></p>
      <p>Tickets count: {tickets.length}</p>
      <ul style={{ maxHeight: 100, overflowY: "auto", paddingLeft: 20 }}>
        {tickets.map(ticket => (
          <li key={ticket.id}>{ticket.title || ticket.id}</li>
        ))}
      </ul>
    </div>
  );
}

function CustomBarChart({
  title,
  data,
  dataKey,
  perc = false,
  categoryKey = "priority",
  stacked = false,
  colors = [],
  teamsByCategory = {},
  slaStatusByTeam = [],
  slaStatusByProject = [],
}) {
  const isEmpty = !data || data.length === 0;
  const fallbackData = [
    {
      [categoryKey]: "No Data",
      ...(Array.isArray(dataKey)
        ? dataKey.reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
        : { [dataKey]: 0 }),
    },
  ];

  const defaultColors = ["#4299e1", "#48bb78", "#ed8936", "#f56565"];

  return (
    <div>
      <p className="text-lg font-semibold text-black dark:text-white mb-4 text-center">
        {title}
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={isEmpty ? fallbackData : data}
          margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
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
          {perc ? (
            <YAxis
              tickFormatter={(value) => `${value}%`}
              stroke="var(--text-color-secondary)"
            />
          ) : (
            <YAxis stroke="var(--text-color-secondary)" />
          )}

          <Tooltip
            content={
              <CustomTooltip
                teamsByCategory={teamsByCategory}
                slaStatusByCategory={
                  categoryKey === "team"
                    ? slaStatusByTeam
                    : categoryKey === "project"
                    ? slaStatusByProject
                    : []
                }
                isPercent={perc}
              />
            }
          />

          <Legend wrapperStyle={{ color: "var(--text-color-primary)" }} />

          {Array.isArray(dataKey) ? (
            dataKey.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId={stacked ? "a" : undefined}
                fill={colors[index] || defaultColors[index % defaultColors.length]}
              >
                {perc && (
                  <LabelList
                    dataKey={key}
                    position="top"
                    formatter={(value) => `${value}%`}
                  />
                )}
              </Bar>
            ))
          ) : (
            <Bar dataKey={dataKey} fill={colors[0] || defaultColors[0]}>
              {perc && (
                <LabelList
                  dataKey={dataKey}
                  position="top"
                  formatter={(value) => `${value}%`}
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
