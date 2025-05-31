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


function CustomTooltip({ active, payload, label, teamsByCategory, slaStatusByTeam }) {
  if (active && payload && payload.length) {
    const teams = teamsByCategory[label] || [];
    const slaData = slaStatusByTeam.find(item => item.name === label) || {};

    return (
      <div style={{ padding: 10, backgroundColor: '#fff', border: '1px solid #ccc' }}>
        <p><strong>{label}</strong></p>
        <p>Total tickets: {payload[0].value}</p>
        {slaData.Met !== undefined && slaData.Exceeded !== undefined && (
          <>
            <p>SLA Met: {slaData.Met}</p>
            <p>SLA Exceeded: {slaData.Exceeded}</p>
          </>
        )}
        <hr />
        <p><strong>Teams in this category:</strong></p>
        {teams.length > 0 ? (
          <ul>
            {teams.map(team => (
              <li key={team}>{team}</li>
            ))}
          </ul>
        ) : (
          <p>No teams assigned</p>
        )}
      </div>
    );
  }
  return null;
}

function CustomBarChart({
  title,
  data,
  dataKey, 
    
  perc = false,
  categoryKey = "priority",
  stacked = false,
  colors = [],
    teamsByCategory = {}
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
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--card-border)"
          />
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
  content={<CustomTooltip teamsByCategory={teamsByCategory} />}
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
