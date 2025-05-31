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
import React, { useRef } from "react";

function CustomTooltip({ active, payload, label, showPercentage }) {
  const scrollRef = useRef(null);

  if (!(active && payload && payload.length)) return null;

  const data = payload[0].payload || {};
  const tickets = data.tickets || [];
  const title = data.priority || data.team || data.team_assigned_person || 
               data.project || data.name || label || "N/A";
  const value = data.count || data[payload[0].dataKey] || 0;
  const percentage = data.perc || 0;

  const isStackedSla = Array.isArray(payload) && payload.some(
    item => item.name === "Met" || item.name === "Exceeded"
  );

  const handleWheel = (e) => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const delta = e.deltaY;

    if ((delta > 0 && scrollTop + clientHeight >= scrollHeight) || 
        (delta < 0 && scrollTop <= 0)) {
      e.preventDefault();
    }
    e.stopPropagation();
  };

  return (
    <div style={{
      backgroundColor: "rgba(255, 255, 255, 0.98)",
      color: "#333",
      padding: "12px 16px",
      border: "1px solid #e1e1e1",
      borderRadius: "8px",
      fontSize: "14px",
      width: "320px",
      maxHeight: "400px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      backdropFilter: "blur(4px)",
      display: "flex",
      flexDirection: "column",
      gap: "8px"
    }}>
      <div style={{
        borderBottom: "1px solid #f0f0f0",
        paddingBottom: "8px",
        marginBottom: "8px"
      }}>
        <p style={{ 
          fontWeight: 600, 
          margin: 0,
          fontSize: "15px",
          color: "#222"
        }}>{title}</p>
        <p style={{ margin: 0, color: "#666" }}>
          Total: <strong>{value}</strong>
          {showPercentage && (
            <span> ({percentage}%)</span>
          )}
        </p>
        {isStackedSla && (
          <>
            <p style={{ margin: "4px 0 0", color: "#666" }}>
              Met SLA: <strong style={{ color: "#4CAF50" }}>{data.Met || 0}</strong>
            </p>
            <p style={{ margin: "4px 0 0", color: "#666" }}>
              Exceeded SLA: <strong style={{ color: "#F44336" }}>{data.Exceeded || 0}</strong>
            </p>
          </>
        )}
      </div>

      {tickets.length > 0 ? (
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          style={{
            overflowY: "auto",
            scrollbarWidth: "thin",
            paddingRight: "4px",
            maxHeight: "300px"
          }}
        >
          <ul style={{
            padding: 0,
            margin: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            {tickets.map((ticket) => (
              <li key={ticket.id} style={{
                padding: "10px",
                backgroundColor: "#f9f9f9",
                borderRadius: "6px",
                borderLeft: `3px solid ${
                  ticket.priority === 'High' ? '#F44336' :
                  ticket.priority === 'Medium' ? '#FF9800' :
                  ticket.priority === 'Low' ? '#4CAF50' : '#4285F4'
                }`
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "4px 12px",
                  fontSize: "13px"
                }}>
                  <span style={{ color: "#666", fontWeight: 500 }}>ID:</span>
                  <span>{ticket.id}</span>
                  <span style={{ color: "#666", fontWeight: 500 }}>Project:</span>
                  <span>{ticket.project || "N/A"}</span>
                  <span style={{ color: "#666", fontWeight: 500 }}>Priority:</span>
                  <span>{ticket.priority || "N/A"}</span>
                  {ticket.team_assigned_person && (
                    <>
                      <span style={{ color: "#666", fontWeight: 500 }}>Team:</span>
                      <span>{ticket.team_assigned_person}</span>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p style={{ color: "#666", fontStyle: "italic", margin: 0 }}>
          No tickets available for this category
        </p>
      )}
    </div>
  );
}

function CustomBarChart({
  title,
  data,
  dataKey,
  categoryKey = "priority",
  stacked = false,
  colors = [],
  showBothValues = false,
  totalCount,
  ...props
}) {
  const isEmpty = !data || data.length === 0;
  const defaultColors = ["#4299e1", "#48bb78", "#ed8936", "#f56565"];
  const fallbackData = [{
    [categoryKey]: "No Data",
    ...(Array.isArray(dataKey) ? 
      dataKey.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}) : 
      { [dataKey]: 0 })
  }];

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
          <YAxis stroke="var(--text-color-secondary)" />
          
          <Tooltip content={<CustomTooltip showPercentage={showBothValues} />} />
          <Legend wrapperStyle={{ color: "var(--text-color-primary)" }} />

          {Array.isArray(dataKey) ? (
            dataKey.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId={stacked ? "a" : undefined}
                fill={colors[index] || defaultColors[index % defaultColors.length]}
              >
                {showBothValues && (
                  <LabelList
                    dataKey={key}
                    position="top"
                    formatter={(value, index, entry) => {
                      const total = data.reduce((sum, item) => sum + item[key], 0);
                      const percentage = total ? Math.round((value / total) * 100) : 0;
                      return `${value} (${percentage}%)`;
                    }}
                  />
                )}
              </Bar>
            ))
          ) : (
            <Bar 
              dataKey={dataKey} 
              fill={colors[0] || defaultColors[0]}
            >
              {showBothValues && (
                <LabelList
                  dataKey={dataKey}
                  position="top"
                  formatter={(value) => {
                    const total = totalCount || 
                               data.reduce((sum, item) => sum + item[dataKey], 0);
                    const percentage = total ? Math.round((value / total) * 100) : 0;
                    return `${value} (${percentage}%)`;
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