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

function CustomTooltip({
  active,
  payload,
  label,
  categoryKey,
  teamsByCategory = {},
  slaStatusByCategory = [],
  isPercent = false,
}) {
  if (!(active && payload && payload.length)) return null;

 
  const values = payload.map((entry) => {
    const key = entry.dataKey;
    const value = isPercent ? `${entry.value}%` : entry.value;
    const color = entry.color || entry.fill;
    const project = entry.payload?.project || "N/A";
    const team = entry.payload?.team_assigned_person || "N/A";

    return { key, value, color, project, team };
  });

  const teams = teamsByCategory[label] || [];
  const slaStatus = slaStatusByCategory.find((item) => item.name === label);

  return (
   <div style={{
  padding: 12,
  backgroundColor: "#fff",
  border: "1px solid #ccc",
  borderRadius: 4,
  maxWidth: 300,
  zIndex: 9999,
  position: "relative",
  color: "#000", 
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
}}>

      <p style={{ marginBottom: 6, fontWeight: "bold", fontSize: 16 }}>{label}</p>

      <div style={{ marginBottom: 8 }}>
        {values.map(({ key, value, color, project, team }) => (
          <div key={key} style={{ marginBottom: 8 }}>
            <p style={{ color, margin: 0 }}><strong>{key}</strong>: {value}</p>
            <p style={{ margin: 0, fontSize: 12 }}>Project: {project}</p>
            <p style={{ margin: 0, fontSize: 12 }}>Team: {team}</p>
          </div>
        ))}
      </div>

      {slaStatus && (
        <>
          <hr />
          <p style={{ margin: "6px 0", fontWeight: "bold" }}>SLA Status</p>
          {Object.entries(slaStatus).map(([key, val]) =>
            key !== "name" ? (
              <p key={key} style={{ margin: 0 }}>{key}: {val}</p>
            ) : null
          )}
        </>
      )}

      {teams.length > 0 && (
        <>
          <hr />
          <p style={{ margin: "6px 0", fontWeight: "bold" }}>Teams in this category:</p>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {teams.map((team) => (
              <li key={team}>{team}</li>
            ))}
          </ul>
        </>
      )}
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
  content={
    <CustomTooltip
      categoryKey={categoryKey}
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
