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

function CustomTooltip({ active, payload, label, showPercentage, showProjects }) {
  const scrollRef = useRef(null);

  if (!(active && payload && payload.length)) return null;

  const data = payload[0].payload || {};
  const tickets = data.tickets || [];
  const title = data.team_assigned_person || data.team || data.name || label || "N/A";
  const value = data.count || data[payload[0].dataKey] || 0;
  const percentage = data.perc || 0;

  // Group tickets by project
  const projects = {};
  tickets.forEach(ticket => {
    const project = ticket.project || "N/A";
    if (!projects[project]) {
      projects[project] = {
        count: 0,
        tickets: []
      };
    }
    projects[project].count++;
    projects[project].tickets.push(ticket);
  });

  // ... rest of the handleWheel and other functions remain the same ...

  return (
    <div style={/* your existing styles */}>
      <div style={/* header styles */}>
        <p style={/* title styles */}>{title}</p>
        <p style={{ margin: 0, color: "#666" }}>
          Total: <strong>{value}</strong>
          {showPercentage && (
            <span> ({percentage}%)</span>
          )}
        </p>
      </div>

      {/* Projects section */}
      {showProjects && (
        <div style={{ marginBottom: '10px' }}>
          <p style={{ fontWeight: 500, margin: '5px 0' }}>Projects:</p>
          {Object.entries(projects).map(([project, { count }]) => (
            <p key={project} style={{ margin: '2px 0', fontSize: '13px' }}>
              {project}: {count} tickets
            </p>
          ))}
        </div>
      )}

      {/* Rest of your ticket list rendering */}
      {tickets.length > 0 ? (
        // ... your existing ticket list code
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
  showProjects = false, // New prop to control project display
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

  // Function to extract unique projects for a team
  const getTeamProjects = (teamData) => {
    if (!showProjects || !teamData.tickets) return null;
    const projects = {};
    teamData.tickets.forEach(ticket => {
      if (ticket.project) {
        projects[ticket.project] = (projects[ticket.project] || 0) + 1;
      }
    });
    return Object.entries(projects).map(([project, count]) => 
      `${project}: ${count}`
    ).join('\n');
  };

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
          
          <Tooltip content={<CustomTooltip showPercentage={showBothValues} showProjects={showProjects} />} />
          <Legend wrapperStyle={{ color: "var(--text-color-primary)" }} />

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
            {showProjects && (
              <LabelList
                dataKey={dataKey}
                position="insideTop"
                formatter={(value, index) => {
                  const teamData = data[index];
                  const projects = getTeamProjects(teamData);
                  return projects || '';
                }}
                style={{ fontSize: 10, fill: '#fff' }}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CustomBarChart;