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

function CustomTooltip({ active, payload, label, tickets, categoryKey }) {
  if (active && payload && payload.length) {
    // label e valoarea categoriei, ex: "High"
    // categoryKey e "priority" sau "team_assigned_person", etc.

    // Filtrăm tickets care au valoarea categoryKey = label
    const filteredTickets = tickets.filter(
      (t) => String(t[categoryKey]) === String(label)
    );

    // Extragem echipele (team_assigned_person) unice
    const teams = Array.from(
      new Set(
        filteredTickets
          .map((t) => t.team_assigned_person)
          .filter(Boolean)
      )
    );

    // Formatăm cheile pentru afișare frumoasă
    const formatKey = (key) =>
      key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");

    const data = payload[0].payload;

    return (
      <div
        style={{
          backgroundColor: "var(--secondary-bg)",
          border: "1px solid var(--card-border)",
          color: "var(--text-color-primary)",
          padding: "10px",
          borderRadius: "6px",
          fontSize: "14px",
          minWidth: "150px",
        }}
      >
        <p>
          <strong>{label}</strong>
        </p>

        {Object.entries(data).map(([key, value]) => {
          if (key === label) return null;
          return (
            <p key={key}>
              {formatKey(key)}:{" "}
              {typeof value === "number" && key.toLowerCase().includes("perc")
                ? `${value}%`
                : value ?? "N/A"}
            </p>
          );
        })}

        <hr style={{ margin: "8px 0" }} />
        <p><strong>Teams in this category:</strong></p>
        {teams.length > 0 ? (
          <ul style={{ paddingLeft: "16px", margin: 0 }}>
            {teams.map((team) => (
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
   tickets = [],    
  perc = false,
  categoryKey = "priority",
  stacked = false,
  colors = [],
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
            content={<CustomTooltip tickets={tickets} categoryKey={categoryKey} />}
            cursor={{ fill: "rgba(66, 153, 225, 0.1)" }}
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
