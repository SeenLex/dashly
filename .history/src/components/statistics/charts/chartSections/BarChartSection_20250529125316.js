import { useEffect, useState } from "react";
import CustomBarChart from "../chartComponents/CustomBarChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";

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

    // Adapt data depending on type to have proper keys
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
      mappedData = data; // fallback
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

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1>Bar charts</h1>
      </div>
      <CustomHorizontalContainer
        components={[
          // PRIORITY
          <CustomBarChart
            key="num-priority"
            title="Ticket number by priority"
            data={priorityData}
            dataKey="count"
            categoryKey="priority"
          />,
          <CustomBarChart
            key="perc-priority"
            title="Ticket % by priority"
            data={priorityData.map(d => ({
              priority: d.priority,
              perc: ((d.count / priorityData.reduce((acc, cur) => acc + cur.count, 0)) * 100).toFixed(1)
            }))}
            dataKey="perc"
            perc={true}
            categoryKey="priority"
          />,
          <CustomBarChart
            key="sla-num-priority"
            title="Resolution SLA number by priority"
            data={priorityData}
            dataKey="sla_met"
            categoryKey="priority"
          />,
          <CustomBarChart
            key="sla-perc-priority"
            title="Resolution SLA % by priority"
            data={priorityData.map(d => ({
              priority: d.priority,
              perc: d.count === 0 ? 0 : ((d.sla_met / d.count) * 100).toFixed(1)
            }))}
            dataKey="perc"
            categoryKey="priority"
            perc={true}
          />,

          // TEAM
          <CustomBarChart
            key="sla-num-team"
            title="Resolution SLA number by team"
            data={teamData}
            dataKey="sla_met"
            categoryKey="team"
          />,
          <CustomBarChart
            key="sla-perc-team"
            title="Resolution SLA % by team"
            data={teamData.map(d => ({
              team: d.team,
              perc: d.count === 0 ? 0 : ((d.sla_met / d.count) * 100).toFixed(1)
            }))}
            dataKey="perc"
            categoryKey="team"
            perc={true}
          />,
          <CustomBarChart
            key="sla-team-count"
            title="SLA Compliance by Team (Count)"
            data={formatSLAStacked(teamData, "team")}
            dataKey={["Met", "Exceeded"]}
            categoryKey="name"
            stacked={true}
            colors={["#4CAF50", "#F44336"]}
          />,

          // PROJECT
          <CustomBarChart
            key="sla-num-project"
            title="Resolution SLA number by project"
            data={projectData}
            dataKey="sla_met"
            categoryKey="project"
          />,
          <CustomBarChart
            key="sla-perc-project"
            title="Resolution SLA % by project"
            data={projectData.map(d => ({
              project: d.project,
              perc: d.count === 0 ? 0 : ((d.sla_met / d.count) * 100).toFixed(1)
            }))}
            dataKey="perc"
            categoryKey="project"
            perc={true}
          />,
          <CustomBarChart
            key="sla-project-count"
            title="SLA Compliance by Project (Count)"
            data={formatSLAStacked(projectData, "project")}
            dataKey={["Met", "Exceeded"]}
            categoryKey="name"
            stacked={true}
            colors={["#4CAF50", "#F44336"]}
          />,
        ]}
      />
    </>
  );
}

export default BarChartSection;
