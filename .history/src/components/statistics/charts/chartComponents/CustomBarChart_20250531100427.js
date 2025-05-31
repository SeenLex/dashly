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
  isPercent = false,
  slaStatusByCategory = null,
  teamsByCategory = {},
  chartType = null,
  categoryKey = "priority"
}) {
  if (!(active && payload && payload.length)) return null;

  // Prepare the main values to display
  const values = payload.map((entry) => ({
    key: entry.dataKey,
    value: isPercent ? `${entry.value}%` : entry.value,
    color: entry.color,
  }));

  // Get teams for this category
  const teams = teamsByCategory[label] || [];
  
  // Get SLA status if available
  const slaStatus = slaStatusByCategory?.find((item) => item.name === label);

  // Determine what additional info to show based on chart type
  const showSlaStatus = slaStatus && (chartType === 'sla-team' || chartType === 'sla-project');
  const showTeams = teams.length > 0 && (chartType === 'priority' || chartType === 'team');

  return (
    <div style={{ 
      padding: 12, 
      backgroundColor: "#fff", 
      border: "1px solid #ccc", 
      borderRadius: 4, 
      maxWidth: 300,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <p style={{ marginBottom: 6, fontWeight: "bold", fontSize: 16 }}>
        {label}
      </p>

      {/* Main values */}
      <div style={{ marginBottom: 8 }}>
        {values.map(({ key, value, color }) => (
          <p key={key} style={{ color, margin: 0 }}>
            <strong>{key}:</strong> {value}
          </p>
        ))}
      </div>

      {/* SLA Status section */}
      {showSlaStatus && (
        <>
          <hr style={{ margin: '8px 0', borderColor: '#eee' }} />
          <p style={{ margin: "6px 0", fontWeight: "bold" }}>SLA Status</p>
          {Object.entries(slaStatus).map(([key, val]) =>
            key !== "name" ? (
              <p key={key} style={{ margin: 0 }}>
                <strong>{key}:</strong> {val}
              </p>
            ) : null
          )}
        </>
      )}

      {/* Teams section */}
      {showTeams && (
        <>
          <hr style={{ margin: '8px 0', borderColor: '#eee' }} />
          <p style={{ margin: "6px 0", fontWeight: "bold" }}>
            {teams.length === 1 ? 'Team' : 'Teams'} in this category:
          </p>
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
  projectsByCategory = {},
  slaStatusByTeam = null,
  slaStatusByProject = null,
  tickets = [] // Pass the original tickets data
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
  
  // Determine chart type for tooltip
  const chartType = 
    title.includes('team') ? 'team' : 
    title.includes('project') ? 'project' : 
    'priority';

  // Function to get teams working on a specific category
  const getTeamsForCategory = (category) => {
    return teamsByCategory[category] || [];
  };

  // Function to get projects in a specific category
  const getProjectsForCategory = (category) => {
    if (categoryKey === 'project') {
      return [category]; // If the category is already a project
    }
    // For other categories, find unique projects
    const uniqueProjects = new Set();
    tickets.forEach(ticket => {
      if (ticket[categoryKey] === category && ticket.project) {
        uniqueProjects.add(ticket.project);
      }
    });
    return Array.from(uniqueProjects);
  };

  // Function to get teams working on a specific project
  const getTeamsForProject = (project) => {
    const uniqueTeams = new Set();
    tickets.forEach(ticket => {
      if (ticket.project === project && ticket.team_assigned_person) {
        uniqueTeams.add(ticket.team_assigned_person);
      }
    });
    return Array.from(uniqueTeams);
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
          {perc ? (
            <YAxis
              tickFormatter={(value) => `${value}%`}
              stroke="var(--text-color-secondary)"
            />
          ) : (
            <YAxis stroke="var(--text-color-secondary)" />
          )}
          <Tooltip
            content={(props) => (
              <CustomTooltip
                {...props}
                isPercent={perc}
                slaStatusByCategory={
                  chartType === 'team' ? slaStatusByTeam : 
                  chartType === 'project' ? slaStatusByProject : 
                  null
                }
                teamsByCategory={teamsByCategory}
                projectsByCategory={projectsByCategory}
                chartType={chartType}
                categoryKey={categoryKey}
                getTeamsForCategory={getTeamsForCategory}
                getProjectsForCategory={getProjectsForCategory}
                getTeamsForProject={getTeamsForProject}
              />
            )}
          />
          {Array.isArray(dataKey) ? (
            dataKey.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index] || defaultColors[index % defaultColors.length]}
                stackId={stacked ? "stack" : undefined}
              >
                {!stacked && <LabelList dataKey={key} position="top" />}
              </Bar>
            ))
          ) : (
            <Bar
              dataKey={dataKey}
              fill={colors[0] || defaultColors[0]}
            >
              <LabelList dataKey={dataKey} position="top" />
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CustomBarChart;
