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

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    const formatKey = (key) =>
      key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");

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
          // Evită afișarea categoriei pe care o vezi deja în label
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
      </div>
    );
  }

  return null;
}

function CustomBarChart({
  title,
  data,
  dataKey,  tickets = [],    
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

          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(66, 153, 225, 0.1)" }} />
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
