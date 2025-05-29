import { useEffect, useState } from "react";
import CustomBarChart from "../chartComponents/CustomBarChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";

const exportDataToCsv = (filename, data) => {
  if (!data || data.length === 0) return;

  const separator = ",";
  const keys = Object.keys(data[0]);
  let csvContent = keys.join(separator) + "\n";
  csvContent += data
    .map(row => keys.map(k => `"${row[k]}"`).join(separator))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div style={{
      backgroundColor: "rgba(0,0,0,0.8)",
      padding: 10,
      borderRadius: 6,
      color: "white",
      maxWidth: 300,
      fontSize: 12,
    }}>
      <p><strong>{data.priority || data.team || data.project || label}</strong></p>
      {data.count !== undefined && <p>Count: {data.count}</p>}
      {data.perc !== undefined && <p>Percentage: {data.perc}%</p>}
      {/* Dacă ai nevoie de proiecte sau alte detalii, le poți adăuga aici */}
    </div>
  );
};

function BarChartSection({ filters }) {
  const [priorityData, setPriorityData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [allTickets, setAllTickets] = useState([]);

  useEffect(() => {
    fetch("http://localhost/api/tickets.php?mode=all")
      .then(res => res.json())
      .then(data => setAllTickets(data));
  }, []);

  const fetchData = async (type, setData) => {
    const params = new URLSearchParams();

    if (filters.team_assigned_person) params.append("team_assigned_person", filters.team_assigned_person);
    if (filters.team_created_by) params.append("team_created_by", filters.team_created_by);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.project) params.append("project", filters.project);
    if (filters.status) params.append("status", filters.status);
    if (filters.startDate) params.append("dateFrom", filters.startDate);
    if (filters.endDate) params.append("dateTo", filters.endDate);
    if (filters.search) params.append("search", filters.search);

    params.append("mode", "grouped");
    params.append("type", type);

    try {
      const res = await fetch(`http://localhost/api/tickets.php?${params.toString()}`);
      const data = await res.json();

      let mappedData;
      if (type === "priority") {
        mappedData = data.map(d => ({
          priority: d.label,
          count: d.count,
          sla_met: d.sla_met,
          sla_exceeded: d.sla_exceeded,
        }));
      } else if (type === "team_assigned_person") {
        mappedData = data.map(d => ({
          team: d.label,
          count: d.count,
          sla_met: d.sla_met,
          sla_exceeded: d.sla_exceeded,
        }));
      } else if (type === "project") {
        mappedData = data.map(d => ({
          project: d.label,
          count: d.count,
          sla_met: d.sla_met,
          sla_exceeded: d.sla_exceeded,
        }));
      } else {
        mappedData = data;
      }

      setData(mappedData);
    } catch (err) {
      console.error(`Error fetching grouped ${type} data:`, err);
    }
  };

  useEffect(() => {
    fetchData("priority", setPriorityData);
    fetchData("team_assigned_person", setTeamData);
    fetchData("project", setProjectData);
  }, [filters]);

  const formatSLAStacked = (data, categoryKey) =>
    data.map(item => ({
      name: item[categoryKey],
      Met: item.sla_met,
      Exceeded: item.sla_exceeded,
    }));

  const priorityTotal = priorityData.reduce((acc, cur) => acc + cur.count, 0);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1>Bar charts</h1>
      </div>
      <CustomHorizontalContainer
        components={[
          <>
            <CustomBarChart
              key="num-priority"
              title="Ticket number by priority"
              data={priorityData}
              dataKey="count"
              categoryKey="priority"
              customTooltip={<CustomTooltip />}
            />
            <button
              style={{ marginTop: 8, marginBottom: 24 }}
              onClick={() => exportDataToCsv("priority-count.csv", priorityData)}
            >
              Export CSV
            </button>
          </>,

          <>
            <CustomBarChart
              key="perc-priority"
              title="Ticket % by priority"
              data={priorityData.map((d) => ({
                priority: d.priority,
                perc: (
                  (d.count / priorityTotal) *
                  100
                ).toFixed(1),
              }))}
              dataKey="perc"
              perc={true}
              categoryKey="priority"
              customTooltip={<CustomTooltip />}
            />
            <button
              style={{ marginTop: 8, marginBottom: 24 }}
              onClick={() =>
                exportDataToCsv(
                  "priority-perc.csv",
                  priorityData.map((d) => ({
                    priority: d.priority,
                    perc: (
                      (d.count / priorityTotal) *
                      100
                    ).toFixed(1),
                  }))
                )
              }
            >
              Export CSV
            </button>
          </>,

          <>
            <CustomBarChart
              key="sla-num-priority"
              title="Resolution SLA number by priority"
              data={priorityData}
              dataKey="sla_met"
              categoryKey="priority"
              customTooltip={<CustomTooltip />}
            />
            <button
              style={{ marginTop: 8, marginBottom: 24 }}
              onClick={() =>
                exportDataToCsv("priority-sla-met.csv", priorityData)
              }
            >
              Export CSV
            </button>
          </>,

          <>
            <CustomBarChart
              key="sla-perc-priority"
              title="Resolution SLA % by priority"
              data={priorityData.map((d) => ({
                priority: d.priority,
                perc:
                  d.count === 0 ? 0 : ((d.sla_met / d.count) * 100).toFixed(1),
              }))}
              dataKey="perc"
              categoryKey="priority"
              perc={true}
              customTooltip={<CustomTooltip />}
            />
            <button
              style={{ marginTop: 8, marginBottom: 24 }}
              onClick={() =>
                exportDataToCsv(
                  "priority-sla-perc.csv",
                  priorityData.map((d) => ({
                    priority: d.priority,
                    perc:
                      d.count === 0
                        ? 0
                        : ((d.sla_met / d.count) * 100).toFixed(1),
                  }))
                )
              }
            >
              Export CSV
            </button>
          </>,

          <>
            <CustomBarChart
              key="sla-num-team"
              title="Resolution SLA number by team"
              data={teamData}
              dataKey="sla_met"
              categoryKey="team"
              customTooltip={<CustomTooltip />}
            />
            <button
              style={{ marginTop: 8, marginBottom: 24 }}
              onClick={() => exportDataToCsv("team-sla-met.csv", teamData)}
            >
              Export CSV
            </button>
          </>,

          <>
            <CustomBarChart
              key="sla-perc-team"
              title="Resolution SLA % by team"
              data={teamData.map((d) => ({
                team: d.team,
                perc:
                  d.count === 0 ? 0 : ((d.sla_met / d.count) * 100).toFixed(1),
              }))}
              dataKey="perc"
              categoryKey="team"
              perc={true}
              customTooltip={<CustomTooltip />}
            />
            <button
              style={{ marginTop: 8, marginBottom: 24 }}
              onClick={() =>
                exportDataToCsv(
                  "team-sla-perc.csv",
                  teamData.map((d) => ({
                    team: d.team,
                    perc:
                      d.count === 0
                        ? 0
                        : ((d.sla_met / d.count) * 100).toFixed(1),
                  }))
                )
              }
            >
              Export CSV
            </button>
          </>,

          <>
            <CustomBarChart
              key="sla-team-count"
              title="SLA Compliance by Team (Count)"
              data={formatSLAStacked(teamData, "team")}
              dataKey={["Met", "Exceeded"]}
              categoryKey="name"
              stacked={true}
              colors={["#4CAF50", "#F44336"]}
              customTooltip={<CustomTooltip />}
            />
            <button
              style={{ marginTop: 8, marginBottom: 24 }}
              onClick={() =>
                exportDataToCsv(
                  "team-sla-compliance.csv",
                  formatSLAStacked(teamData, "team")
                )
              }
            >
              Export CSV
            </button>
          </>,

          <>
            <CustomBarChart
              key="sla-num-project"
              title="Resolution SLA number by project"
              data={projectData}
              dataKey="sla_met"
              categoryKey="project"
              customTooltip={<CustomTooltip />}
            />
            <button
              style={{ marginTop: 8, marginBottom: 24 }}
              onClick={() => exportDataToCsv("project-sla-met.csv", projectData)}
            >
              Export CSV
            </button>
          </>,

          <>
            <CustomBarChart
              key="sla-perc-project"
              title="Resolution SLA % by project"
              data={projectData.map((d) => ({
                project: d.project,
                perc:
                  d.count === 0 ? 0 : ((d.sla_met / d.count) * 100).toFixed(1),
              }))}
              dataKey="perc"
              categoryKey="project"
              perc={true}
              customTooltip={<CustomTooltip />}
            />
            <button
              style={{ marginTop: 8, marginBottom: 24 }}
              onClick={() =>
                exportDataToCsv(
                  "project-sla-perc.csv",
                  projectData.map((d) => ({
                    project: d.project,
                    perc:
                      d.count === 0
                        ? 0
                        : ((d.sla_met / d.count) * 100).toFixed(1),
                  }))
                )
              }
            >
              Export CSV
            </button>
          </>,

          <>
            <CustomBarChart
              key="sla-project-count"
              title="SLA Compliance by Project (Count)"
              data={formatSLAStacked(projectData, "project")}
              dataKey={["Met", "Exceeded"]}
              categoryKey="name"
              stacked={true}
              colors={["#4CAF50", "#F44336"]}
              customTooltip={<CustomTooltip />}
            />
            <button
              style={{ marginTop: 8, marginBottom: 24 }}
              onClick={() =>
                exportDataToCsv(
                  "project-sla-compliance.csv",
                  formatSLAStacked(projectData, "project")
                )
              }
            >
              Export CSV
            </button>
          </>,
        ]}
      />
    </>
  );
}

export default BarChartSection;
