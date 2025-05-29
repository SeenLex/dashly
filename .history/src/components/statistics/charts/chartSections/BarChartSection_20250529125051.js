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

function BarChartSection({ filters }) {
  const [priorityData, setPriorityData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [projectData, setProjectData] = useState([]);

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
            />
            <button
              style={{ marginTop: "8px", marginBottom: "24px" }}
              onClick={() => exportDataToCsv("priorityData.csv", priorityData)}
            >
              Export Priority Data CSV
            </button>
          </>,

          <>
            <CustomBarChart
              key="perc-priority"
              title="Ticket % by priority"
              data={priorityData.map(d => ({
                priority: d.priority,
                perc: ((d.count / priorityTotal) * 100).toFixed(1),
              }))}
              dataKey="perc"
              perc={true}
              categoryKey="priority"
            />
            <button
              style={{ marginTop: "8px", marginBottom: "24px" }}
              onClick={() =>
                exportDataToCsv(
                  "priorityPercentageData.csv",
                  priorityData.map(d => ({
                    priority: d.priority,
                    perc: ((d.count / priorityTotal) * 100).toFixed(1),
                  }))
                )
              }
            >
              Export Priority % Data CSV
            </button>
          </>,

          <>
            <CustomBarChart
              key="team-chart"
              title="Ticket number by team"
              data={teamData}
              dataKey="count"
              categoryKey="team"
            />
            <button
              style={{ marginTop: "8px", marginBottom: "24px" }}
              onClick={() => exportDataToCsv("teamData.csv", teamData)}
            >
              Export Team Data CSV
            </button>
          </>,

          <>
            <CustomBarChart
              key="project-chart"
              title="Ticket number by project"
              data={projectData}
              dataKey="count"
              categoryKey="project"
            />
            <button
              style={{ marginTop: "8px", marginBottom: "24px" }}
              onClick={() => exportDataToCsv("projectData.csv", projectData)}
            >
              Export Project Data CSV
            </button>
          </>,
        ]}
      />
    </>
  );
}

export default BarChartSection;
